const db = require('../config/database');

class Invitation {
  static findById(id) {
    return db.prepare(`
      SELECT i.*, u.nama AS recipient_nama, u.email AS recipient_email,
        s.judul AS schedule_judul, s.tanggal AS schedule_tanggal
      FROM invitations i
      JOIN users u ON i.recipient_id = u.id
      JOIN schedules s ON i.schedule_id = s.id
      WHERE i.id = ?
    `).get(id);
  }

  static findByRecipient(recipient_id) {
    return db.prepare(`
      SELECT i.*, u.nama AS recipient_nama, u.email AS recipient_email,
        s.judul AS schedule_judul, s.tanggal AS schedule_tanggal,
        s.jam_mulai, s.jam_selesai, s.ruangan, s.lokasi,
        st.code AS type_code, st.name AS type_name
      FROM invitations i
      JOIN users u ON i.recipient_id = u.id
      JOIN schedules s ON i.schedule_id = s.id
      JOIN schedule_types st ON s.schedule_type_id = st.id
      WHERE i.recipient_id = ?
      ORDER BY i.created_at DESC
    `).all(recipient_id);
  }

  static findBySchedule(schedule_id) {
    return db.prepare(`
      SELECT i.*, u.nama AS recipient_nama, u.email AS recipient_email, u.role AS recipient_role
      FROM invitations i
      JOIN users u ON i.recipient_id = u.id
      WHERE i.schedule_id = ?
      ORDER BY i.invitation_type
    `).all(schedule_id);
  }

  static create(data) {
    const { schedule_id, recipient_id, invitation_type, status, email_to, email_subject, email_body } = data;
    const result = db.prepare(`
      INSERT OR REPLACE INTO invitations
        (schedule_id, recipient_id, invitation_type, status, email_to, email_subject, email_body)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      schedule_id, recipient_id, invitation_type,
      status || 'PENDING',
      email_to || null, email_subject || null, email_body || null
    );
    return this.findById(result.lastInsertRowid);
  }

  static markRead(id) {
    db.prepare(
      "UPDATE invitations SET status = 'READ', read_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(id);
    return this.findById(id);
  }

  static markSent(id) {
    db.prepare(
      "UPDATE invitations SET status = 'SENT', sent_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(id);
    return this.findById(id);
  }
}

module.exports = Invitation;
