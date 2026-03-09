const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare(
      'SELECT id, email, nama, role, nip, nim, is_active FROM users WHERE id = ? AND is_active = 1'
    ).get(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = auth;
