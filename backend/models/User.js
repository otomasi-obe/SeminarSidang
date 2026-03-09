const db = require('../config/database');

class User {
  static findById(id) {
    return db.prepare(
      'SELECT id, email, nama, role, nip, nim, is_active, created_at, updated_at FROM users WHERE id = ?'
    ).get(id);
  }

  static findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  static findAll(filters = {}) {
    let query = 'SELECT id, email, nama, role, nip, nim, is_active, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }
    if (filters.search) {
      query += ' AND (nama LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY nama ASC';
    return db.prepare(query).all(...params);
  }

  static create(data) {
    const { email, password, nama, role, nip, nim, created_by } = data;
    const result = db.prepare(
      'INSERT INTO users (email, password, nama, role, nip, nim, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(email, password, nama, role, nip || null, nim || null, created_by || null);
    return this.findById(result.lastInsertRowid);
  }

  static update(id, data) {
    const fields = [];
    const params = [];

    if (data.email !== undefined) { fields.push('email = ?'); params.push(data.email); }
    if (data.password !== undefined) { fields.push('password = ?'); params.push(data.password); }
    if (data.nama !== undefined) { fields.push('nama = ?'); params.push(data.nama); }
    if (data.role !== undefined) { fields.push('role = ?'); params.push(data.role); }
    if (data.nip !== undefined) { fields.push('nip = ?'); params.push(data.nip); }
    if (data.nim !== undefined) { fields.push('nim = ?'); params.push(data.nim); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); params.push(data.is_active); }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  static deactivate(id) {
    db.prepare('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    return this.findById(id);
  }
}

module.exports = User;
