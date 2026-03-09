const bcrypt = require('bcryptjs');
const User = require('../models/User');
const db = require('../config/database');

const getAll = (req, res) => {
  try {
    const { role, is_active, search, page = 1, limit = 50 } = req.query;
    const filters = {};
    if (role) filters.role = role;
    if (is_active !== undefined) filters.is_active = parseInt(is_active);
    if (search) filters.search = search;

    const users = User.findAll(filters);
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginated = users.slice(start, start + parseInt(limit));

    return res.json({ success: true, data: paginated, total: users.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getOne = (req, res) => {
  try {
    const user = User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const create = (req, res) => {
  try {
    const { email, password, nama, role, nip, nim } = req.body;

    if (!email || !password || !nama || !role) {
      return res.status(400).json({ success: false, message: 'email, password, nama and role are required' });
    }

    const validRoles = ['IT_ADMIN', 'ADMIN', 'DOSEN', 'MAHASISWA'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const existing = User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = User.create({ email, password: hashedPassword, nama, role, nip, nim, created_by: req.user.id });

    db.prepare(
      "INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(req.user.id, 'CREATE_USER', 'user', user.id, JSON.stringify({ email, role }), req.ip);

    return res.status(201).json({ success: true, message: 'User created', data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const update = (req, res) => {
  try {
    const existing = User.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    const { email, password, nama, role, nip, nim, is_active } = req.body;
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (nama !== undefined) updateData.nama = nama;
    if (role !== undefined) updateData.role = role;
    if (nip !== undefined) updateData.nip = nip;
    if (nim !== undefined) updateData.nim = nim;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (password) updateData.password = bcrypt.hashSync(password, 10);

    const user = User.update(req.params.id, updateData);

    db.prepare(
      "INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(req.user.id, 'UPDATE_USER', 'user', user.id, JSON.stringify({ fields: Object.keys(updateData) }), req.ip);

    return res.json({ success: true, message: 'User updated', data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deactivate = (req, res) => {
  try {
    const existing = User.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate yourself' });
    }

    User.deactivate(req.params.id);

    db.prepare(
      "INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(req.user.id, 'DEACTIVATE_USER', 'user', req.params.id, JSON.stringify({ email: existing.email }), req.ip);

    return res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getDosen = (req, res) => {
  try {
    const users = User.findAll({ role: 'DOSEN', is_active: 1 });
    return res.json({ success: true, data: users, total: users.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getMahasiswa = (req, res) => {
  try {
    const users = User.findAll({ role: 'MAHASISWA', is_active: 1 });
    return res.json({ success: true, data: users, total: users.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAll, getOne, create, update, deactivate, getDosen, getMahasiswa };
