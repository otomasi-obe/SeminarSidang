const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const db = require('../config/database');

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
];

const login = (req, res) => {
  try {
    const { email, password } = req.body;

    const user = User.findByEmail(email);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nama: user.nama },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    db.prepare(
      "INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(user.id, 'LOGIN', 'user', user.id, JSON.stringify({ email: user.email }), req.ip);

    const { password: _pw, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'Login successful',
      data: { token, user: userWithoutPassword }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const logout = (req, res) => {
  db.prepare(
    "INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(req.user.id, 'LOGOUT', 'user', req.user.id, JSON.stringify({ email: req.user.email }), req.ip);

  return res.json({ success: true, message: 'Logged out successfully' });
};

const me = (req, res) => {
  return res.json({ success: true, data: req.user });
};

module.exports = { login, logout, me, loginValidation };
