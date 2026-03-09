const db = require('../config/database');

const stats = (req, res) => {
  try {
    const schedulesByType = db.prepare(`
      SELECT st.code, st.name, COUNT(s.id) AS count
      FROM schedule_types st
      LEFT JOIN schedules s ON st.id = s.schedule_type_id
      GROUP BY st.id, st.code, st.name
    `).all();

    const schedulesByStatus = db.prepare(`
      SELECT status, COUNT(*) AS count
      FROM schedules
      GROUP BY status
      ORDER BY count DESC
    `).all();

    const usersByRole = db.prepare(`
      SELECT role, COUNT(*) AS count
      FROM users
      WHERE is_active = 1
      GROUP BY role
    `).all();

    const totalSchedules = db.prepare('SELECT COUNT(*) AS count FROM schedules').get();
    const totalUsers = db.prepare('SELECT COUNT(*) AS count FROM users WHERE is_active = 1').get();

    return res.json({
      success: true,
      data: {
        total_schedules: totalSchedules.count,
        total_active_users: totalUsers.count,
        schedules_by_type: schedulesByType,
        schedules_by_status: schedulesByStatus,
        users_by_role: usersByRole
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const schedulesToday = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const schedules = db.prepare(`
      SELECT
        s.id, s.judul, s.tanggal, s.jam_mulai, s.jam_selesai, s.ruangan, s.lokasi, s.status,
        st.code AS type_code, st.name AS type_name,
        m.nama AS mahasiswa_nama, m.nim AS mahasiswa_nim,
        d.nama AS dosen_nama
      FROM schedules s
      JOIN schedule_types st ON s.schedule_type_id = st.id
      JOIN users m ON s.mahasiswa_id = m.id
      JOIN users d ON s.dosen_id = d.id
      WHERE s.tanggal = ?
      ORDER BY s.jam_mulai ASC
    `).all(today);

    return res.json({ success: true, data: schedules, total: schedules.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const upcoming = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const schedules = db.prepare(`
      SELECT
        s.id, s.judul, s.tanggal, s.jam_mulai, s.jam_selesai, s.ruangan, s.lokasi, s.status,
        st.code AS type_code, st.name AS type_name,
        m.nama AS mahasiswa_nama, m.nim AS mahasiswa_nim,
        d.nama AS dosen_nama
      FROM schedules s
      JOIN schedule_types st ON s.schedule_type_id = st.id
      JOIN users m ON s.mahasiswa_id = m.id
      JOIN users d ON s.dosen_id = d.id
      WHERE s.tanggal >= ? AND s.tanggal <= ?
      ORDER BY s.tanggal ASC, s.jam_mulai ASC
    `).all(today, nextWeekStr);

    return res.json({ success: true, data: schedules, total: schedules.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { stats, schedulesToday, upcoming };
