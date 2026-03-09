# Prompt untuk Claude Opus - Sistem Jadwal Seminar & Sidang

Gunakan prompt ini sebagai input untuk meminta Claude Opus mengembangkan sistem secara lengkap.

---

## PROMPT LENGKAP

```
Tugas: Buatkan sistem informasi web lengkap untuk manajemen jadwal seminar dan sidang.

OVERVIEW SISTEM:
Sistem ini untuk universitas/institusi pendidikan dengan 3 jenis kegiatan:
1. Seminar Kerja Praktik (SKP)
2. Seminar Proposal Tugas Akhir (SEMPRO)
3. Sidang Tugas Akhir (SIDANG)

REQUIREMENTS FUNGSIONAL:

1. MANAJEMEN JADWAL
   - Dosen atau Admin bisa membuat jadwal seminar/sidang
   - Setiap jadwal memiliki: tanggal, jam mulai, jam selesai, dosen pembimbing, mahasiswa, judul, ruangan, jenis (SKP/SEMPRO/SIDANG), status
   - Dosen bisa edit jadwal yang mereka buat
   - Admin dapat edit/delete semua jadwal
   - IT Admin memiliki akses penuh

2. LANDING PAGE (PUBLIC)
   - Menampilkan tabel jadwal dengan kolom: Waktu, Jenis, Dosen, Mahasiswa, NIM, Judul, Ruangan, Status
   - Dapat diakses tanpa login (Guest)
   - Filter berdasarkan: jenis (SKP/SEMPRO/SIDANG), dosen, tanggal, mahasiswa
   - Urutkan berdasarkan tanggal ASC

3. USER & AUTHENTICATION
   - Login dengan email + password
   - 4 Role: IT_ADMIN, ADMIN, DOSEN, MAHASISWA
   - IT Admin bisa membuat user baru dengan role apapun
   - Password di-hash (bcrypt)
   - JWT authentication token

4. PERMISSIONS (RBAC)
   - IT_ADMIN: Create/Read/Update/Delete semua, manage users
   - ADMIN: Create/Read/Update/Delete jadwal, manage jadwal, tidak bisa manage users
   - DOSEN: Create jadwal untuk mahasiswa bimbingan mereka, edit jadwal mereka, read semua
   - MAHASISWA: Read-only semua jadwal

5. FITUR TAMBAHAN
   - Dashboard dengan statistik jadwal
   - Export jadwal (CSV/PDF)
   - Search & filter jadwal
   - Update status jadwal (DIJADWALKAN, BERLANGSUNG, SELESAI, DITUNDA, BATAL)

DATABASE:
- Gunakan SQLite
- File database disimpan di: backend/database.db
- Tabel: users, schedules, schedule_types, attendance (optional), penguji (optional)
- Lihat DATABASE_SCHEMA.md untuk detail lengkap

STACK TEKNOLOGI (REKOMENDASI):
Backend:
- Nodejs + Express.js (atau Python FastAPI)
- SQLite3
- JWT untuk auth
- bcrypt untuk password hashing
- CORS enabled

Frontend:
- React.js (atau Vue.js/Next.js)
- Tailwind CSS untuk styling
- Axios untuk HTTP requests
- React Router untuk navigation

STRUKTUR FOLDER:
```
SeminarSidang/
├── README.md
├── .gitignore
├── PROJECT_SPEC.md
├── DATABASE_SCHEMA.md
├── API_ENDPOINTS.md
├── USER_ROLES.md
├── PROMPT_CLAUDE_OPUS.md (ini)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app.js / main.py
│   ├── database.db (akan di-generate)
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   ├── package.json / requirements.txt
│   └── .env (local development)
└── docs/
    ├── SETUP.md
    ├── API_DOCS.md
    └── DEPLOYMENT.md
```

ENDPOINT API UTAMA (Lihat API_ENDPOINTS.md untuk lengkap):
- POST /api/auth/login
- GET /api/schedules (public - landing page)
- POST /api/schedules (create jadwal)
- PUT /api/schedules/:id (update jadwal)
- DELETE /api/schedules/:id (delete jadwal)
- POST /api/users (create user - IT Admin only)
- GET /api/users (get all users - IT Admin only)
- PATCH /api/schedules/:id/status (update status)

INTERFACE REQUIREMENT:

Landing Page (Public):
- Header dengan logo/nama institusi
- Tabel jadwal dengan sorting & filtering
- Tombol login (top-right)
- Responsif di mobile

Admin Dashboard:
- Sidebar navigation
- Statistik jadwal (chart)
- Manajemen jadwal (CRUD)
- Manajemen user (IT Admin only)

Dosen Dashboard:
- Sidebar navigation
- Jadwal mereka
- Create schedule form
- List jadwal SEMUA

Mahasiswa Dashboard:
- Sidebar navigation
- Jadwal pribadi
- View semua jadwal (read-only)

LOGIN PAGE:
- Form email/password
- Responsive design
- Remember me option

DATABASE SCHEMA (RINGKAS):

users (id, email, password_hash, nama, role, nip, nim, is_active, created_at, updated_at, created_by)

schedule_types (id, code: SKP/SEMPRO/SIDANG, name, description)

schedules (id, schedule_type_id, mahasiswa_id, judul, dosen_id, tanggal, jam_mulai, jam_selesai, ruangan, lokasi, status, catatan, created_at, updated_at, created_by)

DEVELOPMENT CHECKLIST:

Backend:
- ✅ Setup Express/FastAPI server
- ✅ Setup SQLite database & migrations
- ✅ Create database schema & seed data
- ✅ Implement JWT authentication
- ✅ Implement RBAC middleware
- ✅ Implement all API endpoints
- ✅ Input validation & error handling
- ✅ CORS configuration
- ✅ Environment variables setup

Frontend:
- ✅ Setup React project (Vite recommended)
- ✅ Create layout & components
- ✅ Implement login page
- ✅ Implement landing page (public schedules)
- ✅ Implement admin dashboard
- ✅ Implement schedule management (CRUD)
- ✅ Implement user management
- ✅ Create auth context/state management
- ✅ Implement filtering & search
- ✅ Responsive design

TESTING:
- Test login dengan berbagai role
- Test RBAC di setiap endpoint
- Test schedule conflict detection
- Test filtering & sorting
- Test create/update/delete schedule
- Test user management
- Test mobile responsiveness

PRIORITAS:
1. Backend authentication & database
2. Basic frontend + landing page
3. Schedule CRUD
4. Admin/Dosen dashboard
5. User management
6. Export & Advanced features

DELIVERABLES:
1. Backend code (app.js + folder struktur)
2. Frontend code (React components + styles)
3. Database schema & migration scripts
4. README.md dengan setup instructions
5. .env.example untuk configuration
6. API documentation
7. User roles documentation

NOTES:
- Gunakan best practices untuk security (input validation, password hashing, CORS, rate limiting)
- Implement proper error handling & logging
- Buatkan contoh data untuk testing
- Code harus clean, readable, dan well-commented
- Implement pagination untuk list endpoints
- Add timestamp untuk audit trail (created_at, updated_at, created_by)
- Responsif design untuk mobile & desktop

DELIVERABLE OUTPUT:
Buatkan kode lengkap dengan struktur folder yang siap production. Sertakan:
1. Backend complete dengan semua routes, models, controllers
2. Frontend complete dengan semua pages & components
3. Database initialization script
4. Documentation lengkap (setup, deployment, API)
5. Contoh .env file
6. README dengan development flow
```

---

## TIPS PENGGUNAAN PROMPT

1. **Copy-paste prompt di atas ke Claude Opus** (sebaiknya gunakan Claude Opus 4, bukan versi lebih kecil)

2. **Jika perlu customization**, tambahkan spesifikasi tambahan:
   - Bahasa yang digunakan (Indonesia/Inggris)
   - Database preferences (PostgreSQL instead of SQLite)
   - UI Framework preferences (Bootstrap/Material-UI)
   - Additional features

3. **Jika Claude Opus memberikan output yang terlalu banyak**:
   - Minta output dalam multiple parts
   - Prioritaskan backend dulu, kemudian frontend
   - Bisa split menjadi 2-3 prompt terpisah

4. **Untuk implementasi bertahap**:
   - Phase 1: Prompt untuk setup + backend
   - Phase 2: Prompt untuk frontend
   - Phase 3: Prompt untuk deployment + documentation

---

## TEMPLATE FOLLOW-UP QUESTIONS

Jika perlu clarification atau iteration:

```
"Buat update pada sistem berikut:
- [Spesifikasi perubahan]
- [File mana yang diaffect]
- [Behavior yang diinginkan]
```

```
"Tambahkan fitur:
- [Deskripsi fitur]
- [Use case]
- [API endpoint jika diperlukan]
```

```
"Fix bug:
- [Deskripsi bug]
- [Expected behavior]
- [Actual behavior]
```

---

## RESOURCES TERCAKUP DALAM REPO

- `PROJECT_SPEC.md` - Overview & spesifikasi sistem
- `DATABASE_SCHEMA.md` - Detail database & queries
- `API_ENDPOINTS.md` - Semua API endpoints dengan contoh
- `USER_ROLES.md` - Detail roles & permissions
- `PROMPT_CLAUDE_OPUS.md` - File ini untuk development

---

## NOTES PENTING

✅ Sudah ada dokumentasi lengkap di repo
✅ Ready untuk development dengan Claude Opus
✅ Database schema sudah final
✅ API design sudah difinalisasi
✅ User roles & permissions sudah clear

❌ Backend code - belum created
❌ Frontend code - belum created
❌ Database migration scripts - belum created
❌ Deployment docs - belum created

Next: Gunakan prompt ini dengan Claude Opus untuk generate complete codebase!
