const db = require('../config/database');

class Examiner {
  static findBySchedule(schedule_id) {
    return db.prepare(`
      SELECT e.id, e.schedule_id, e.peran, e.score, e.feedback, e.created_at,
        u.id AS dosen_id, u.nama AS dosen_nama, u.nip AS dosen_nip, u.email AS dosen_email
      FROM examiners e
      JOIN users u ON e.dosen_id = u.id
      WHERE e.schedule_id = ?
      ORDER BY e.peran
    `).all(schedule_id);
  }

  static findById(id) {
    return db.prepare(`
      SELECT e.id, e.schedule_id, e.dosen_id, e.peran, e.score, e.feedback, e.created_at,
        u.nama AS dosen_nama, u.nip AS dosen_nip, u.email AS dosen_email
      FROM examiners e
      JOIN users u ON e.dosen_id = u.id
      WHERE e.id = ?
    `).get(id);
  }

  static add(schedule_id, dosen_id, peran) {
    const result = db.prepare(
      'INSERT INTO examiners (schedule_id, dosen_id, peran) VALUES (?, ?, ?)'
    ).run(schedule_id, dosen_id, peran);
    return this.findById(result.lastInsertRowid);
  }

  static remove(id) {
    return db.prepare('DELETE FROM examiners WHERE id = ?').run(id);
  }

  static updateScore(id, score, feedback) {
    db.prepare('UPDATE examiners SET score = ?, feedback = ? WHERE id = ?').run(score, feedback || null, id);
    return this.findById(id);
  }

  static deleteBySchedule(schedule_id) {
    return db.prepare('DELETE FROM examiners WHERE schedule_id = ?').run(schedule_id);
  }
}

module.exports = Examiner;
