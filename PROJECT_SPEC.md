# Spesifikasi Sistem Informasi Jadwal Seminar & Sidang

## 1. Ringkasan Proyek

Sistem Informasi Web untuk manajemen jadwal seminar dan sidang yang mencakup:
- **Seminar Kerja Praktik (SKP)**
- **Seminar Proposal Tugas Akhir (SEMPRO)**
- **Sidang Tugas Akhir (SIDANG)**

## 2. Fitur Utama

### 2.1 Manajemen Jadwal
- Input/edit jadwal oleh Dosen atau Admin
- Menampilkan informasi lengkap jadwal pada landing page
- Filter berdasarkan jenis pembimbingan, dosen, atau mahasiswa

### 2.2 Manajemen User
- IT Admin dapat membuat user baru
- Role-based access control (RBAC)
- Login dengan email dan password

### 2.3 Landing Page (Display Jadwal)
Menampilkan tabel dengan kolom:
- **Waktu/Tanggal**: Tanggal dan jam pelaksanaan
- **Jenis**: SKP / SEMPRO / SIDANG
- **Dosen Pembimbing**: Nama dosen
- **Mahasiswa**: Nama mahasiswa / NIM
- **Judul**: Judul seminar/capstone
- **Lokasi/Ruangan**: (optional)
- **Status**: Aktif/Selesai/Ditunda

## 3. User Roles & Permissions

| Role | Create | Read | Edit | Delete | Manage User |
|------|--------|------|------|--------|-------------|
| IT Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ❌ |
| Dosen | ✅* | ✅ | ✅* | ❌ | ❌ |
| Mahasiswa | ❌ | ✅ | ❌ | ❌ | ❌ |
| Guest | ❌ | ✅** | ❌ | ❌ | ❌ |

*Dosen hanya bisa kelola jadwal yang mereka bimbing
**Guest hanya bisa melihat landing page (read-only)

### Permissions Detail:
- **IT Admin**: Full access semua, bisa create/edit/delete user
- **Admin**: Create, read, edit jadwal; tidak bisa manage user
- **Dosen**: Create jadwal untuk mahasiswa mereka, edit jadwal mereka, read semua jadwal
- **Mahasiswa**: Read-only, bisa lihat jadwal mereka dan jadwal publik
- **Guest**: Access landing page (read-only, tanpa login)

## 4. Arsitektur Teknis

### 4.1 Tech Stack (Recommended)
- **Frontend**: React.js / Vue.js / Next.js
- **Backend**: Node.js (Express/Fastify) atau Python (FastAPI/Flask)
- **Database**: SQLite (.db file)
- **Auth**: JWT tokens
- **API**: RESTful API

### 4.2 Struktur Folder
```
SeminarSidang/
├── README.md
├── .gitignore
├── PROJECT_SPEC.md
├── DATABASE_SCHEMA.md
├── API_ENDPOINTS.md
├── USER_ROLES.md
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/
│   ├── app.js / main.py
│   ├── database.db
│   ├── requirements.txt / package.json
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── controllers/
│   └── ...
└── docs/
    ├── SETUP.md
    └── DEPLOYMENT.md
```

## 5. Database

Database disimpan sebagai file SQLite (`.db`) di folder backend: `/backend/database.db`

Tabel utama:
- `users` - Data user (email, password, role, nama)
- `schedules` - Jadwal seminar/sidang
- `schedule_types` - Master tipe (SKP, SEMPRO, SIDANG)
- `attendance` - Kehadiran (optional)

Lihat `DATABASE_SCHEMA.md` untuk detail lengkap.

## 6. API Endpoints

Dokumentasi lengkap di `API_ENDPOINTS.md`

### Contoh Endpoint Utama:
- `GET /api/schedules` - Get semua jadwal
- `POST /api/schedules` - Create jadwal baru
- `PUT /api/schedules/:id` - Update jadwal
- `DELETE /api/schedules/:id` - Delete jadwal
- `POST /api/auth/login` - Login
- `POST /api/users` - Create user (IT Admin only)

## 7. Security Requirements

- Password harus di-hash menggunakan bcrypt
- Implementasi JWT untuk authentication
- CORS configuration untuk frontend
- Input validation di backend
- SQL injection prevention
- Role-based access control di setiap endpoint

## 8. Deployment

- Backend dapat di-deploy di server Linux (Node/Python)
- Frontend dapat di-host di static server
- Database disimpan di local/server filesystem
- Environment variables untuk config sensitive data

## 9. Timeline Development

1. **Phase 1**: Setup infrastructure & database
2. **Phase 2**: Backend API development
3. **Phase 3**: Frontend UI development
4. **Phase 4**: Integration & testing
5. **Phase 5**: Deployment & documentation

---

**Next Step**: Baca `DATABASE_SCHEMA.md` dan `API_ENDPOINTS.md` untuk detail teknis lebih lanjut.
