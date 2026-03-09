const Schedule = require('../models/Schedule');
const Examiner = require('../models/Examiner');
const Invitation = require('../models/Invitation');
const db = require('../config/database');

const auditLog = (userId, action, resourceId, details, ip) => {
  db.prepare(
    "INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(userId, action, 'schedule', resourceId, JSON.stringify(details), ip);
};

const getAll = (req, res) => {
  try {
    const { type, status, date_from, date_to } = req.query;
    const filters = {};

    if (type) filters.type_code = type;
    if (status) filters.status = status;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

    const role = req.user.role;
    if (role === 'MAHASISWA') {
      filters.mahasiswa_id = req.user.id;
    } else if (role === 'DOSEN') {
      filters.dosen_id = req.user.id;
    }

    const schedules = Schedule.findAll(filters);
    return res.json({ success: true, data: schedules, total: schedules.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getOne = (req, res) => {
  try {
    const schedule = Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const role = req.user.role;
    if (role === 'MAHASISWA' && schedule.mahasiswa_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (role === 'DOSEN') {
      const isExaminer = db.prepare('SELECT id FROM examiners WHERE schedule_id = ? AND dosen_id = ?').get(schedule.id, req.user.id);
      if (schedule.dosen_id !== req.user.id && !isExaminer) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }

    return res.json({ success: true, data: schedule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const create = (req, res) => {
  try {
    const { schedule_type_id, mahasiswa_id, judul, dosen_id, tanggal, jam_mulai, jam_selesai, ruangan, lokasi, catatan } = req.body;

    if (!schedule_type_id || !mahasiswa_id || !judul || !dosen_id || !tanggal || !jam_mulai || !jam_selesai) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const schedType = db.prepare('SELECT * FROM schedule_types WHERE id = ?').get(schedule_type_id);
    if (!schedType) return res.status(400).json({ success: false, message: 'Invalid schedule type' });

    // DOSEN can only create SKP
    if (req.user.role === 'DOSEN' && schedType.code !== 'SKP') {
      return res.status(403).json({ success: false, message: 'DOSEN can only create SKP schedules' });
    }

    const { dosenConflict, roomConflict } = Schedule.checkConflict(dosen_id, ruangan, tanggal, jam_mulai, jam_selesai);
    if (dosenConflict) {
      return res.status(409).json({ success: false, message: 'Dosen has a conflicting schedule at that time' });
    }
    if (roomConflict) {
      return res.status(409).json({ success: false, message: 'Room is already booked at that time' });
    }

    let status = 'DIJADWALKAN';
    if (schedType.code !== 'SKP' && ['IT_ADMIN', 'ADMIN'].includes(req.user.role)) {
      status = 'SUBMITTED_TO_PRODI';
    }

    const schedule = Schedule.create({
      schedule_type_id, mahasiswa_id, judul, dosen_id,
      tanggal, jam_mulai, jam_selesai, ruangan, lokasi,
      status, catatan, created_by: req.user.id
    });

    auditLog(req.user.id, 'CREATE_SCHEDULE', schedule.id, { judul, type: schedType.code }, req.ip);

    return res.status(201).json({ success: true, message: 'Schedule created', data: schedule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const update = (req, res) => {
  try {
    const existing = Schedule.getRaw(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const role = req.user.role;
    if (role === 'DOSEN') {
      const schedType = db.prepare('SELECT code FROM schedule_types WHERE id = ?').get(existing.schedule_type_id);
      if (schedType.code !== 'SKP' || existing.dosen_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'DOSEN can only update their own SKP schedules' });
      }
    }

    const { judul, dosen_id, tanggal, jam_mulai, jam_selesai, ruangan, lokasi, catatan } = req.body;

    const newDosenId = dosen_id || existing.dosen_id;
    const newTanggal = tanggal || existing.tanggal;
    const newJamMulai = jam_mulai || existing.jam_mulai;
    const newJamSelesai = jam_selesai || existing.jam_selesai;
    const newRuangan = ruangan !== undefined ? ruangan : existing.ruangan;

    if (tanggal || jam_mulai || jam_selesai || ruangan || dosen_id) {
      const { dosenConflict, roomConflict } = Schedule.checkConflict(
        newDosenId, newRuangan, newTanggal, newJamMulai, newJamSelesai, req.params.id
      );
      if (dosenConflict) {
        return res.status(409).json({ success: false, message: 'Dosen has a conflicting schedule at that time' });
      }
      if (roomConflict) {
        return res.status(409).json({ success: false, message: 'Room is already booked at that time' });
      }
    }

    const updateData = {};
    if (judul !== undefined) updateData.judul = judul;
    if (dosen_id !== undefined) updateData.dosen_id = dosen_id;
    if (tanggal !== undefined) updateData.tanggal = tanggal;
    if (jam_mulai !== undefined) updateData.jam_mulai = jam_mulai;
    if (jam_selesai !== undefined) updateData.jam_selesai = jam_selesai;
    if (ruangan !== undefined) updateData.ruangan = ruangan;
    if (lokasi !== undefined) updateData.lokasi = lokasi;
    if (catatan !== undefined) updateData.catatan = catatan;

    const schedule = Schedule.update(req.params.id, updateData);
    auditLog(req.user.id, 'UPDATE_SCHEDULE', schedule.id, { fields: Object.keys(updateData) }, req.ip);

    return res.json({ success: true, message: 'Schedule updated', data: schedule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteSchedule = (req, res) => {
  try {
    const existing = Schedule.getRaw(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Schedule not found' });

    Schedule.delete(req.params.id);
    auditLog(req.user.id, 'DELETE_SCHEDULE', req.params.id, { judul: existing.judul }, req.ip);

    return res.json({ success: true, message: 'Schedule deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateStatus = (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const existing = Schedule.getRaw(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const schedule = Schedule.update(req.params.id, { status });
    auditLog(req.user.id, 'UPDATE_STATUS', schedule.id, { status }, req.ip);

    return res.json({ success: true, message: 'Status updated', data: schedule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const assignExaminers = (req, res) => {
  try {
    const { examiners } = req.body;
    if (!Array.isArray(examiners) || examiners.length === 0) {
      return res.status(400).json({ success: false, message: 'examiners array is required' });
    }

    const existing = Schedule.getRaw(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const validPeran = ['PEMBIMBING', 'PENGUJI_1', 'PENGUJI_2', 'KETUA_PENGUJI'];
    for (const e of examiners) {
      if (!e.dosen_id || !e.peran) {
        return res.status(400).json({ success: false, message: 'Each examiner needs dosen_id and peran' });
      }
      if (!validPeran.includes(e.peran)) {
        return res.status(400).json({ success: false, message: `Invalid peran: ${e.peran}` });
      }
    }

    const assignTx = db.transaction(() => {
      Examiner.deleteBySchedule(req.params.id);
      for (const e of examiners) {
        Examiner.add(req.params.id, e.dosen_id, e.peran);
      }
      Schedule.update(req.params.id, { status: 'EXAMINERS_ASSIGNED' });
    });
    assignTx();

    const schedule = Schedule.findById(req.params.id);
    auditLog(req.user.id, 'ASSIGN_EXAMINERS', schedule.id, { count: examiners.length }, req.ip);

    return res.json({ success: true, message: 'Examiners assigned', data: schedule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const setSchedule = (req, res) => {
  try {
    const { tanggal, jam_mulai, jam_selesai, ruangan, lokasi } = req.body;

    if (!tanggal || !jam_mulai || !jam_selesai) {
      return res.status(400).json({ success: false, message: 'tanggal, jam_mulai and jam_selesai are required' });
    }

    const existing = Schedule.getRaw(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const { dosenConflict, roomConflict } = Schedule.checkConflict(
      existing.dosen_id, ruangan, tanggal, jam_mulai, jam_selesai, req.params.id
    );
    if (dosenConflict) {
      return res.status(409).json({ success: false, message: 'Dosen has a conflicting schedule at that time' });
    }
    if (roomConflict) {
      return res.status(409).json({ success: false, message: 'Room is already booked at that time' });
    }

    const dateObj = new Date(tanggal);
    dateObj.setDate(dateObj.getDate() - 3);
    const deadline = dateObj.toISOString().split('T')[0];

    const schedule = Schedule.update(req.params.id, {
      tanggal, jam_mulai, jam_selesai, ruangan, lokasi,
      deadline_invitation: deadline,
      status: 'SCHEDULED'
    });

    auditLog(req.user.id, 'SET_SCHEDULE', schedule.id, { tanggal, jam_mulai, jam_selesai, ruangan }, req.ip);

    return res.json({ success: true, message: 'Schedule set', data: schedule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const sendInvitations = (req, res) => {
  try {
    const existing = Schedule.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Schedule not found' });

    // H-3 validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = existing.deadline_invitation ? new Date(existing.deadline_invitation) : null;
    if (!deadline) {
      return res.status(400).json({ success: false, message: 'deadline_invitation not set. Please set schedule first.' });
    }
    deadline.setHours(0, 0, 0, 0);
    if (today > deadline) {
      return res.status(400).json({ success: false, message: 'Cannot send invitations after deadline (H-3)' });
    }

    const sendTx = db.transaction(() => {
      // Create invitations for each examiner
      for (const examiner of existing.examiners) {
        const subjectPrefix = existing.type_code;
        Invitation.create({
          schedule_id: existing.id,
          recipient_id: examiner.dosen_id,
          invitation_type: examiner.peran === 'PEMBIMBING' ? 'SUPERVISOR' : 'EXAMINER',
          status: 'SENT',
          email_to: examiner.dosen_email,
          email_subject: `Undangan ${subjectPrefix}: ${existing.judul}`,
          email_body: `Yth. ${examiner.dosen_nama},\n\nAnda diundang sebagai ${examiner.peran} pada ${subjectPrefix} berikut:\n\nJudul: ${existing.judul}\nMahasiswa: ${existing.mahasiswa_nama}\nTanggal: ${existing.tanggal}\nWaktu: ${existing.jam_mulai} - ${existing.jam_selesai}\nRuangan: ${existing.ruangan || '-'}\n\nTerima kasih.`
        });
      }
      // Create invitation for mahasiswa
      Invitation.create({
        schedule_id: existing.id,
        recipient_id: existing.mahasiswa_id,
        invitation_type: 'STUDENT',
        status: 'SENT',
        email_to: existing.mahasiswa_email,
        email_subject: `Jadwal ${existing.type_code}: ${existing.judul}`,
        email_body: `Yth. ${existing.mahasiswa_nama},\n\nBerikut adalah jadwal ${existing.type_code} Anda:\n\nJudul: ${existing.judul}\nTanggal: ${existing.tanggal}\nWaktu: ${existing.jam_mulai} - ${existing.jam_selesai}\nRuangan: ${existing.ruangan || '-'}\n\nTerima kasih.`
      });

      Schedule.update(req.params.id, { status: 'INVITATION_SENT' });
    });
    sendTx();

    const schedule = Schedule.findById(req.params.id);
    auditLog(req.user.id, 'SEND_INVITATIONS', schedule.id, { examiner_count: existing.examiners.length }, req.ip);

    return res.json({ success: true, message: 'Invitations sent', data: schedule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const startExam = (req, res) => {
  try {
    const existing = Schedule.getRaw(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const schedule = Schedule.update(req.params.id, { status: 'START_EXAM' });
    auditLog(req.user.id, 'START_EXAM', schedule.id, {}, req.ip);

    return res.json({ success: true, message: 'Exam started', data: schedule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const complete = (req, res) => {
  try {
    const existing = Schedule.getRaw(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const schedule = Schedule.update(req.params.id, { status: 'COMPLETED' });
    auditLog(req.user.id, 'COMPLETE_SCHEDULE', schedule.id, {}, req.ip);

    return res.json({ success: true, message: 'Schedule completed', data: schedule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAll, getOne, create, update, delete: deleteSchedule,
  updateStatus, assignExaminers, setSchedule, sendInvitations, startExam, complete
};
