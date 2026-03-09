const db = require('../config/database');

class Schedule {
  static findAll(filters = {}) {
    let query = `
      SELECT
        s.id, s.judul, s.tanggal, s.jam_mulai, s.jam_selesai, s.ruangan, s.lokasi,
        s.status, s.catatan, s.deadline_invitation, s.created_at, s.updated_at,
        st.id AS schedule_type_id, st.code AS type_code, st.name AS type_name,
        m.id AS mahasiswa_id, m.nama AS mahasiswa_nama, m.nim AS mahasiswa_nim,
        d.id AS dosen_id, d.nama AS dosen_nama, d.nip AS dosen_nip
      FROM schedules s
      JOIN schedule_types st ON s.schedule_type_id = st.id
      JOIN users m ON s.mahasiswa_id = m.id
      JOIN users d ON s.dosen_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.mahasiswa_id) {
      query += ' AND s.mahasiswa_id = ?';
      params.push(filters.mahasiswa_id);
    }
    if (filters.dosen_id) {
      query += ' AND (s.dosen_id = ? OR s.id IN (SELECT schedule_id FROM examiners WHERE dosen_id = ?))';
      params.push(filters.dosen_id, filters.dosen_id);
    }
    if (filters.type_code) {
      query += ' AND st.code = ?';
      params.push(filters.type_code);
    }
    if (filters.status) {
      query += ' AND s.status = ?';
      params.push(filters.status);
    }
    if (filters.date_from) {
      query += ' AND s.tanggal >= ?';
      params.push(filters.date_from);
    }
    if (filters.date_to) {
      query += ' AND s.tanggal <= ?';
      params.push(filters.date_to);
    }
    if (filters.tanggal) {
      query += ' AND s.tanggal = ?';
      params.push(filters.tanggal);
    }

    query += ' ORDER BY s.tanggal ASC, s.jam_mulai ASC';
    return db.prepare(query).all(...params);
  }

  static findById(id) {
    const schedule = db.prepare(`
      SELECT
        s.id, s.judul, s.tanggal, s.jam_mulai, s.jam_selesai, s.ruangan, s.lokasi,
        s.status, s.catatan, s.deadline_invitation, s.created_at, s.updated_at,
        st.id AS schedule_type_id, st.code AS type_code, st.name AS type_name,
        m.id AS mahasiswa_id, m.nama AS mahasiswa_nama, m.nim AS mahasiswa_nim, m.email AS mahasiswa_email,
        d.id AS dosen_id, d.nama AS dosen_nama, d.nip AS dosen_nip, d.email AS dosen_email
      FROM schedules s
      JOIN schedule_types st ON s.schedule_type_id = st.id
      JOIN users m ON s.mahasiswa_id = m.id
      JOIN users d ON s.dosen_id = d.id
      WHERE s.id = ?
    `).get(id);

    if (!schedule) return null;

    schedule.examiners = db.prepare(`
      SELECT e.id, e.peran, e.score, e.feedback,
        u.id AS dosen_id, u.nama AS dosen_nama, u.nip AS dosen_nip, u.email AS dosen_email
      FROM examiners e
      JOIN users u ON e.dosen_id = u.id
      WHERE e.schedule_id = ?
    `).all(id);

    return schedule;
  }

  static create(data) {
    const {
      schedule_type_id, mahasiswa_id, judul, dosen_id,
      tanggal, jam_mulai, jam_selesai, ruangan, lokasi,
      status, catatan, deadline_invitation, created_by
    } = data;

    const result = db.prepare(`
      INSERT INTO schedules
        (schedule_type_id, mahasiswa_id, judul, dosen_id, tanggal, jam_mulai, jam_selesai,
         ruangan, lokasi, status, catatan, deadline_invitation, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      schedule_type_id, mahasiswa_id, judul, dosen_id,
      tanggal, jam_mulai, jam_selesai,
      ruangan || null, lokasi || null,
      status || 'DIJADWALKAN',
      catatan || null,
      deadline_invitation || null,
      created_by || null
    );
    return this.findById(result.lastInsertRowid);
  }

  static update(id, data) {
    const fields = [];
    const params = [];

    const allowed = [
      'schedule_type_id', 'mahasiswa_id', 'judul', 'dosen_id',
      'tanggal', 'jam_mulai', 'jam_selesai', 'ruangan', 'lokasi',
      'status', 'catatan', 'deadline_invitation'
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  static delete(id) {
    db.prepare('DELETE FROM examiners WHERE schedule_id = ?').run(id);
    db.prepare('DELETE FROM invitations WHERE schedule_id = ?').run(id);
    return db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
  }

  static checkConflict(dosen_id, ruangan, tanggal, jam_mulai, jam_selesai, excludeId = null) {
    // Time overlap condition: existing.jam_mulai < new.jam_selesai AND existing.jam_selesai > new.jam_mulai
    // Params order: (jam_selesai, jam_mulai) to match (existing.jam_mulai < new_end AND existing.jam_selesai > new_start)
    let dosenQuery = `
      SELECT id FROM schedules
      WHERE dosen_id = ? AND tanggal = ?
        AND jam_mulai < ? AND jam_selesai > ?
    `;
    const dosenParams = [dosen_id, tanggal, jam_selesai, jam_mulai];

    if (excludeId) {
      dosenQuery += ' AND id != ?';
      dosenParams.push(excludeId);
    }
    const dosenConflict = db.prepare(dosenQuery).get(...dosenParams);

    // Check room conflict
    let roomConflict = null;
    if (ruangan) {
      let roomQuery = `
        SELECT id FROM schedules
        WHERE ruangan = ? AND tanggal = ?
          AND jam_mulai < ? AND jam_selesai > ?
      `;
      const roomParams = [ruangan, tanggal, jam_selesai, jam_mulai];

      if (excludeId) {
        roomQuery += ' AND id != ?';
        roomParams.push(excludeId);
      }
      roomConflict = db.prepare(roomQuery).get(...roomParams);
    }

    return { dosenConflict, roomConflict };
  }

  static getRaw(id) {
    return db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
  }
}

module.exports = Schedule;
