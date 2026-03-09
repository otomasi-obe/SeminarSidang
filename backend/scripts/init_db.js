require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK(role IN ('IT_ADMIN','ADMIN','DOSEN','MAHASISWA')),
    nip VARCHAR(50),
    nim VARCHAR(50),
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS schedule_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_type_id INTEGER NOT NULL REFERENCES schedule_types(id),
    mahasiswa_id INTEGER NOT NULL REFERENCES users(id),
    judul VARCHAR(500) NOT NULL,
    dosen_id INTEGER NOT NULL REFERENCES users(id),
    tanggal DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    ruangan VARCHAR(100),
    lokasi VARCHAR(255),
    status VARCHAR(50) DEFAULT 'DIJADWALKAN',
    catatan TEXT,
    deadline_invitation DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    CHECK(jam_mulai < jam_selesai)
);

CREATE TABLE IF NOT EXISTS examiners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL REFERENCES schedules(id),
    dosen_id INTEGER NOT NULL REFERENCES users(id),
    peran VARCHAR(50) NOT NULL CHECK(peran IN ('PEMBIMBING','PENGUJI_1','PENGUJI_2','KETUA_PENGUJI')),
    score REAL,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(schedule_id, dosen_id)
);

CREATE TABLE IF NOT EXISTS invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL REFERENCES schedules(id),
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    invitation_type VARCHAR(50) NOT NULL CHECK(invitation_type IN ('EXAMINER','SUPERVISOR','STUDENT')),
    status VARCHAR(50) DEFAULT 'PENDING' CHECK(status IN ('PENDING','SENT','READ','BOUNCED')),
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    email_to VARCHAR(255),
    email_subject VARCHAR(500),
    email_body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(schedule_id, recipient_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

console.log('Tables created successfully');

// Seed users
const SALT_ROUNDS = 10;
const password = bcrypt.hashSync('admin123', SALT_ROUNDS);

const seedUsers = [
  { email: 'itadmin@university.edu', password, nama: 'IT Administrator', role: 'IT_ADMIN', nip: null, nim: null },
  { email: 'admin@university.edu', password, nama: 'Admin Akademik', role: 'ADMIN', nip: null, nim: null },
  { email: 'dosen1@university.edu', password, nama: 'Dr. Budi Santoso', role: 'DOSEN', nip: '198501101234567', nim: null },
  { email: 'dosen2@university.edu', password, nama: 'Prof. Siti Rahayu', role: 'DOSEN', nip: '197803151234567', nim: null },
  { email: 'dosen3@university.edu', password, nama: 'Dr. Ahmad Fauzi', role: 'DOSEN', nip: '198001201234567', nim: null },
  { email: 'mhs1@university.edu', password, nama: 'Andi Pratama', role: 'MAHASISWA', nip: null, nim: '21001001' },
  { email: 'mhs2@university.edu', password, nama: 'Budi Wicaksono', role: 'MAHASISWA', nip: null, nim: '21001002' },
  { email: 'mhs3@university.edu', password, nama: 'Citra Dewi', role: 'MAHASISWA', nip: null, nim: '21001003' },
];

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (email, password, nama, role, nip, nim) VALUES (?, ?, ?, ?, ?, ?)'
);

const insertUsersTx = db.transaction((users) => {
  for (const u of users) {
    insertUser.run(u.email, u.password, u.nama, u.role, u.nip, u.nim);
  }
});
insertUsersTx(seedUsers);
console.log('Users seeded');

// Seed schedule_types
const insertType = db.prepare('INSERT OR IGNORE INTO schedule_types (code, name, description) VALUES (?, ?, ?)');
const insertTypesTx = db.transaction(() => {
  insertType.run('SKP', 'Seminar Kerja Praktik', 'Seminar hasil kerja praktik mahasiswa');
  insertType.run('SEMPRO', 'Seminar Proposal', 'Seminar proposal penelitian/skripsi');
  insertType.run('SIDANG', 'Sidang Skripsi', 'Sidang akhir skripsi/tugas akhir');
});
insertTypesTx();
console.log('Schedule types seeded');

// Get IDs for seeding schedules
const typeSkp = db.prepare('SELECT id FROM schedule_types WHERE code = ?').get('SKP');
const typeSempro = db.prepare('SELECT id FROM schedule_types WHERE code = ?').get('SEMPRO');
const typeSidang = db.prepare('SELECT id FROM schedule_types WHERE code = ?').get('SIDANG');

const userAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@university.edu');
const dosen1 = db.prepare('SELECT id FROM users WHERE email = ?').get('dosen1@university.edu');
const dosen2 = db.prepare('SELECT id FROM users WHERE email = ?').get('dosen2@university.edu');
const dosen3 = db.prepare('SELECT id FROM users WHERE email = ?').get('dosen3@university.edu');
const mhs1 = db.prepare('SELECT id FROM users WHERE email = ?').get('mhs1@university.edu');
const mhs2 = db.prepare('SELECT id FROM users WHERE email = ?').get('mhs2@university.edu');
const mhs3 = db.prepare('SELECT id FROM users WHERE email = ?').get('mhs3@university.edu');

const insertSchedule = db.prepare(`
  INSERT OR IGNORE INTO schedules
    (schedule_type_id, mahasiswa_id, judul, dosen_id, tanggal, jam_mulai, jam_selesai, ruangan, lokasi, status, catatan, deadline_invitation, created_by)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const seedSchedules = db.transaction(() => {
  // SKP - DIJADWALKAN (past)
  insertSchedule.run(
    typeSkp.id, mhs1.id,
    'Implementasi Machine Learning untuk Prediksi Cuaca',
    dosen1.id,
    fmt(addDays(today, -10)), '09:00', '10:00', 'R.101', 'Gedung A Lantai 1',
    'DIJADWALKAN', null, fmt(addDays(today, -13)),
    userAdmin.id
  );

  // SKP - COMPLETED
  insertSchedule.run(
    typeSkp.id, mhs2.id,
    'Pengembangan Aplikasi Mobile E-Commerce',
    dosen2.id,
    fmt(addDays(today, -5)), '10:00', '11:00', 'R.102', 'Gedung A Lantai 1',
    'COMPLETED', 'Seminar berjalan lancar', fmt(addDays(today, -8)),
    userAdmin.id
  );

  // SEMPRO - SUBMITTED_TO_PRODI
  insertSchedule.run(
    typeSempro.id, mhs1.id,
    'Analisis Sentimen Media Sosial dengan Deep Learning',
    dosen1.id,
    fmt(addDays(today, 7)), '13:00', '14:30', 'R.201', 'Gedung B Lantai 2',
    'SUBMITTED_TO_PRODI', null, fmt(addDays(today, 4)),
    userAdmin.id
  );

  // SEMPRO - SCHEDULED
  insertSchedule.run(
    typeSempro.id, mhs3.id,
    'Sistem Rekomendasi Berbasis Collaborative Filtering',
    dosen3.id,
    fmt(addDays(today, 14)), '09:00', '10:30', 'R.202', 'Gedung B Lantai 2',
    'SCHEDULED', null, fmt(addDays(today, 11)),
    userAdmin.id
  );

  // SIDANG - EXAMINERS_ASSIGNED
  insertSchedule.run(
    typeSidang.id, mhs2.id,
    'Pengembangan Sistem Informasi Manajemen Akademik',
    dosen2.id,
    fmt(addDays(today, 21)), '10:00', '12:00', 'R.301', 'Gedung C Lantai 3',
    'EXAMINERS_ASSIGNED', null, fmt(addDays(today, 18)),
    userAdmin.id
  );

  // SIDANG - INVITATION_SENT (upcoming)
  insertSchedule.run(
    typeSidang.id, mhs3.id,
    'Rancang Bangun Aplikasi Web Sistem Perpustakaan Digital',
    dosen1.id,
    fmt(addDays(today, 3)), '14:00', '16:00', 'R.302', 'Gedung C Lantai 3',
    'INVITATION_SENT', null, fmt(today),
    userAdmin.id
  );
});

seedSchedules();
console.log('Sample schedules seeded');

// Seed examiners for a couple of schedules
const schedSidang1 = db.prepare('SELECT id FROM schedules WHERE mahasiswa_id = ? AND schedule_type_id = ?').get(mhs2.id, typeSidang.id);
const schedSidang2 = db.prepare('SELECT id FROM schedules WHERE mahasiswa_id = ? AND schedule_type_id = ?').get(mhs3.id, typeSidang.id);

const insertExaminer = db.prepare('INSERT OR IGNORE INTO examiners (schedule_id, dosen_id, peran) VALUES (?, ?, ?)');
const seedExaminers = db.transaction(() => {
  if (schedSidang1) {
    insertExaminer.run(schedSidang1.id, dosen2.id, 'PEMBIMBING');
    insertExaminer.run(schedSidang1.id, dosen1.id, 'PENGUJI_1');
    insertExaminer.run(schedSidang1.id, dosen3.id, 'KETUA_PENGUJI');
  }
  if (schedSidang2) {
    insertExaminer.run(schedSidang2.id, dosen1.id, 'PEMBIMBING');
    insertExaminer.run(schedSidang2.id, dosen2.id, 'PENGUJI_1');
    insertExaminer.run(schedSidang2.id, dosen3.id, 'PENGUJI_2');
  }
});
seedExaminers();
console.log('Examiners seeded');

console.log('\nDatabase initialized successfully!');
console.log('Default password for all users: admin123');
db.close();
