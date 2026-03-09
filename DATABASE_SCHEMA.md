# Database Schema

## Deskripsi Database

Database menggunakan SQLite dengan file disimpan di: `/backend/database.db`

## Tabel-Tabel

### 1. `users`
Menyimpan data semua user dalam sistem.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- hashed password (bcrypt)
    nama VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,  -- 'IT_ADMIN', 'ADMIN', 'DOSEN', 'MAHASISWA'
    nip VARCHAR(50),  -- untuk dosen (NIP)
    nim VARCHAR(50),  -- untuk mahasiswa
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Kolom:**
- `id`: Primary key
- `email`: Email unique untuk login
- `password`: Password ter-hash (bcrypt)
- `nama`: Nama lengkap user
- `role`: Peran dalam sistem (IT_ADMIN, ADMIN, DOSEN, MAHASISWA)
- `nip`: NIP dosen (optional)
- `nim`: NIM mahasiswa (optional)
- `is_active`: Status aktif/non-aktif
- `created_at`: Waktu pembuatan
- `updated_at`: Waktu update terakhir
- `created_by`: ID user yang membuat user ini (tracking audit)

---

### 2. `schedule_types`
Master data tipe-tipe jadwal.

```sql
CREATE TABLE schedule_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,  -- 'SKP', 'SEMPRO', 'SIDANG'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Kolom:**
- `id`: Primary key
- `code`: Kode tipe (SKP, SEMPRO, SIDANG)
- `name`: Nama lengkap
- `description`: Deskripsi

**Data Default:**
```
INSERT INTO schedule_types (code, name, description) VALUES
('SKP', 'Seminar Kerja Praktik', 'Seminar untuk Kerja Praktik'),
('SEMPRO', 'Seminar Proposal', 'Seminar Proposal Tugas Akhir'),
('SIDANG', 'Sidang Tugas Akhir', 'Sidang Tugas Akhir');
```

---

### 3. `schedules`
Menyimpan data jadwal seminar dan sidang.

```sql
CREATE TABLE schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_type_id INTEGER NOT NULL,
    
    -- Informasi Mahasiswa & Judul
    mahasiswa_id INTEGER NOT NULL,
    judul VARCHAR(255) NOT NULL,
    
    -- Dosen Pembimbing
    dosen_id INTEGER NOT NULL,
    
    -- Waktu & Lokasi
    tanggal DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    ruangan VARCHAR(100),
    lokasi VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'DIJADWALKAN',  -- DIJADWALKAN, BERLANGSUNG, SELESAI, DITUNDA, BATAL
    catatan TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    
    FOREIGN KEY (schedule_type_id) REFERENCES schedule_types(id),
    FOREIGN KEY (mahasiswa_id) REFERENCES users(id),
    FOREIGN KEY (dosen_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    -- Constraint
    CHECK (jam_mulai < jam_selesai)
);
```

**Kolom:**
- `id`: Primary key
- `schedule_type_id`: Referensi ke `schedule_types` (SKP/SEMPRO/SIDANG)
- `mahasiswa_id`: ID mahasiswa yang mengadakan seminar
- `judul`: Judul seminar/capstone
- `dosen_id`: ID dosen pembimbing
- `tanggal`: Tanggal pelaksanaan
- `jam_mulai`: Jam mulai (HH:MM:SS)
- `jam_selesai`: Jam selesai (HH:MM:SS)
- `ruangan`: Nama ruangan/lab
- `lokasi`: Lokasi fisik (building, campus)
- `status`: Status jadwal (DIJADWALKAN, BERLANGSUNG, SELESAI, DITUNDA, BATAL)
- `catatan`: Catatan tambahan
- `created_at`: Waktu pembuatan
- `updated_at`: Waktu update terakhir
- `created_by`: User yang membuat jadwal

---

### 4. `penguji` (Optional - untuk SEMPRO & SIDANG)
Untuk menyimpan daftar penguji/examiner.

```sql
CREATE TABLE penguji (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    dosen_id INTEGER NOT NULL,
    peran VARCHAR(50),  -- 'PEMBIMBING', 'PENGUJI_1', 'PENGUJI_2', 'KETUA_PENGUJI'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (dosen_id) REFERENCES users(id),
    UNIQUE(schedule_id, dosen_id)
);
```

---

### 5. `attendance` (Optional - untuk tracking kehadiran)
Tracking kehadiran peserta seminar/sidang.

```sql
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    hadir BOOLEAN,
    waktu_hadir TIMESTAMP,
    keterangan VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(schedule_id, user_id)
);
```

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │
│ email       │
│ password    │
│ nama        │
│ role        │
│ nip         │
│ nim         │
└─────────────┘
      ▲
      │ references
      ├─────────────────────────┬─────────────────┐
      │                         │                 │
      │                         │                 │
┌─────────────┐     ┌───────────────────┐  ┌─────────────────┐
│ schedules   │     │ schedule_types    │  │   attendance    │
├─────────────┤     ├───────────────────┤  ├─────────────────┤
│ id (PK)     │     │ id (PK)           │  │ id (PK)         │
│ schedule... │────→│ code              │  │ schedule_id (FK)│
│ mahasiswa_id│─────→users              │  │ user_id (FK)    │
│ judul       │     │ name              │  │ hadir           │
│ dosen_id    │─────→users              │  │ waktu_hadir     │
│ tanggal     │     │ description       │  └─────────────────┘
│ jam_mulai   │     └───────────────────┘
│ jam_selesai │
│ ruangan     │
│ status      │
└─────────────┘
```

---

## Queries Penting

### Get Jadwal Landing Page
```sql
SELECT 
    s.id,
    s.tanggal,
    s.jam_mulai,
    s.jam_selesai,
    st.code as jenis,
    st.name as jenis_nama,
    u_dosen.nama as dosen,
    u_mhs.nama as mahasiswa,
    u_mhs.nim,
    s.judul,
    s.ruangan,
    s.status
FROM schedules s
JOIN schedule_types st ON s.schedule_type_id = st.id
JOIN users u_dosen ON s.dosen_id = u_dosen.id
JOIN users u_mhs ON s.mahasiswa_id = u_mhs.id
WHERE s.status != 'BATAL'
    AND s.tanggal >= DATE('now')
ORDER BY s.tanggal ASC, s.jam_mulai ASC;
```

### Get Jadwal by Dosen
```sql
SELECT * FROM schedules 
WHERE dosen_id = ? 
ORDER BY tanggal DESC;
```

### Get Jadwal by Mahasiswa
```sql
SELECT * FROM schedules 
WHERE mahasiswa_id = ? 
ORDER BY tanggal DESC;
```

### Count Jadwal by Type
```sql
SELECT st.code, COUNT(*) as total
FROM schedules s
JOIN schedule_types st ON s.schedule_type_id = st.id
WHERE s.tanggal >= DATE('now')
GROUP BY st.code;
```

---

## Data Types & Constraints

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | INTEGER | PRIMARY KEY | Auto-increment |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| password | VARCHAR(255) | NOT NULL | Hashed dengan bcrypt |
| tanggal | DATE | NOT NULL | Format YYYY-MM-DD |
| jam_mulai | TIME | NOT NULL | Format HH:MM:SS |
| jam_selesai | TIME | NOT NULL | Format HH:MM:SS |
| status | VARCHAR(50) | DEFAULT 'DIJADWALKAN' | Enum values |
| is_active | BOOLEAN | DEFAULT 1 | 0 = inactive, 1 = active |

---

## Indeks (Performance)

```sql
-- Untuk query cepat
CREATE INDEX idx_schedules_tanggal ON schedules(tanggal);
CREATE INDEX idx_schedules_dosen_id ON schedules(dosen_id);
CREATE INDEX idx_schedules_mahasiswa_id ON schedules(mahasiswa_id);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

## Migration/Setup

Untuk setup database pertama kali, jalankan semua CREATE TABLE statements di atas dalam urutan:
1. `schedule_types`
2. `users`
3. `schedules`
4. `penguji` (jika diperlukan)
5. `attendance` (jika diperlukan)
6. Buat indeks
7. Insert data default untuk `schedule_types`
