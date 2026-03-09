const Examiner = require('../models/Examiner');
const Schedule = require('../models/Schedule');
const db = require('../config/database');

const list = (req, res) => {
  try {
    const schedule = Schedule.getRaw(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const examiners = Examiner.findBySchedule(req.params.id);
    return res.json({ success: true, data: examiners, total: examiners.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const add = (req, res) => {
  try {
    const { dosen_id, peran } = req.body;
    if (!dosen_id || !peran) {
      return res.status(400).json({ success: false, message: 'dosen_id and peran are required' });
    }

    const validPeran = ['PEMBIMBING', 'PENGUJI_1', 'PENGUJI_2', 'KETUA_PENGUJI'];
    if (!validPeran.includes(peran)) {
      return res.status(400).json({ success: false, message: 'Invalid peran' });
    }

    const schedule = Schedule.getRaw(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const dosen = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'DOSEN' AND is_active = 1").get(dosen_id);
    if (!dosen) return res.status(400).json({ success: false, message: 'Dosen not found or inactive' });

    const examiner = Examiner.add(req.params.id, dosen_id, peran);
    return res.status(201).json({ success: true, message: 'Examiner added', data: examiner });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Dosen is already an examiner for this schedule' });
    }
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const remove = (req, res) => {
  try {
    const examiner = Examiner.findById(req.params.examinerId);
    if (!examiner || examiner.schedule_id !== parseInt(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Examiner not found' });
    }

    Examiner.remove(req.params.examinerId);
    return res.json({ success: true, message: 'Examiner removed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateScore = (req, res) => {
  try {
    const { score, feedback } = req.body;

    const examiner = Examiner.findById(req.params.examinerId);
    if (!examiner || examiner.schedule_id !== parseInt(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Examiner not found' });
    }

    // DOSEN can only score if they are the examiner
    if (req.user.role === 'DOSEN' && examiner.dosen_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: you are not the examiner for this entry' });
    }

    if (score !== undefined && (isNaN(score) || score < 0 || score > 100)) {
      return res.status(400).json({ success: false, message: 'Score must be between 0 and 100' });
    }

    const updated = Examiner.updateScore(req.params.examinerId, score !== undefined ? score : examiner.score, feedback);
    return res.json({ success: true, message: 'Score updated', data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { list, add, remove, updateScore };
