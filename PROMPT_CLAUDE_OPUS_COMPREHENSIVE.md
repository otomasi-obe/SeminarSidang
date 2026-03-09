# Prompt Comprehensive untuk Claude Opus 4.6 - Sistem Jadwal Seminar & Sidang

**Instruksi**: Copy-paste seluruh prompt di bawah ini ke Claude Opus 4.6 untuk generate complete codebase.

---

## PROMPT COMPREHENSIVE - CLAUDE OPUS 4.6

```
TUGAS UTAMA:
Buatkan sistem informasi web LENGKAP dan PRODUCTION-READY untuk manajemen jadwal seminar, 
proposal, dan sidang akademik di institusi pendidikan dengan penuh detail dan best practices.

===========================================
BAGIAN 1: OVERVIEW SISTEM
===========================================

NAMA SISTEM: Sistem Jadwal Seminar & Sidang

TUJUAN: 
- Centralize penjadwalan kegiatan akademik
- Streamline workflow approval (Mahasiswa → Dosen → Prodi)
- Facilitate penjadwalan otomatis dengan aturan akademik
- Provide comprehensive visibility ke semua stakeholder

TIPE KEGIATAN (3 jenis):
1. SKP (Seminar Kerja Praktik)
   - Dosen atau Admin create jadwal
   - Simple workflow: Create → display di landing page

2. SEMPRO (Seminar Proposal Tugas Akhir)
   - Admin manage workflow dengan penguji & undangan
   - Alur: Admin assign penguji → set jadwal → kirim undangan (H-3) → execute

3. SIDANG (Sidang Tugas Akhir)
   - Similar ke SEMPRO
   - Formal examination dengan score/result

===========================================
BAGIAN 2: USER ROLES & PERMISSIONS
===========================================

ROLE 1: IT_ADMIN (IT Administrator)
├─ Permissions: Create/Read/Update/Delete ALL
├─ User Management: Create, edit, deactivate any user
├─ System Access: Full access to system settings, logs, backups
├─ Khusus: Database management, system monitoring
└─ Dashboard: System admin panel dengan statistics

ROLE 2: ADMIN (Administrator - Akademik & Workflow)
├─ Permissions:
│   ├─ Create/Edit/Delete semua schedules (SKP/SEMPRO/SIDANG)
│   ├─ Assign examiners untuk SEMPRO/SIDANG
│   ├─ Set schedule & location
│   ├─ Send invitations ke penguji (dengan H-3 validation)
│   ├─ View & manage semua proposal
│   ├─ Monitor workflow progress
│   └─ View all dashboards & reports
├─ Limitation: Cannot manage users (IT_ADMIN only)
└─ Dashboard: Admin management dashboard

ROLE 3: DOSEN (Lecturer/Supervisor)
├─ Permissions:
│   ├─ Create SKP schedules
│   ├─ Edit schedules yang mereka buat
│   ├─ View all schedules (read-only)
│   └─ As examiner: review & input score pada SEMPRO/SIDANG
├─ Limitation: SKP hanya untuk mahasiswa bimbingan mereka
└─ Dashboard: Lecturer dashboard dengan jadwal mereka

GUEST (No Login)
├─ Permissions: View public landing page
├─ Display: Semua scheduled jadwal dengan filter
└─ Limitation: Tanpa akses management features

PERMISSION MATRIX:
┌──────────────────────────────────────┐
│       Feature        │IT_ADMIN│ADMIN│DOSEN│
├──────────────────────────────────────┤
│ Create Schedule      │   ✅   │ ✅  │ ✅ │
│ Edit Schedule        │   ✅   │ ✅  │ ✅*│
│ Delete Schedule      │   ✅   │ ✅  │ ❌ │
│ Assign Examiners     │   ✅   │ ✅  │ ❌ │
│ Set Jadwal & Tempat  │   ✅   │ ✅  │ ❌ │
│ Send Invitations     │   ✅   │ ✅  │ ❌ │
│ Manage Users         │   ✅   │ ❌  │ ❌ │
│ View Dashboard       │   ✅   │ ✅  │ ✅ │
│ Input Score (Exam)   │   ✅   │ ✅  │ ✅ │
└──────────────────────────────────────┘
*Dosen hanya edit jadwal yang mereka buat

===========================================
BAGIAN 3: WORKFLOW & PROSES AKADEMIK
===========================================

WORKFLOW SKP (Simple - Dosen langsung jadwal):
DOSEN create jadwal 
   → Auto-check konflik 
   → SCHEDULE_CREATED (Status)
   → Jadwal langsung tampil di landing page
   → Pada hari H: Status → BERLANGSUNG → SELESAI


WORKFLOW SEMPRO (Complex - dengan penguji & undangan):

STEP 1: ADMIN RECEIVE PROPOSAL
   └─ Admin dapat notifikasi ada pending proposal
   └─ Status: SUBMITTED_TO_PRODI

STEP 2: ADMIN ASSIGN EXAMINERS
   └─ Aksi: Prodi assign 2-3 dosen penguji
   └─ Status: EXAMINERS_ASSIGNED
   └─ Noti: Penguji dapat notifikasi assignment

STEP 3: ADMIN SET SCHEDULE & LOCATION
   └─ Aksi: Set tanggal, jam, ruangan, lokasi
   └─ Validation: Cek konflik dengan jadwal dosen & tempat
   └─ Auto-calculate: H-3 deadline untuk kirim undangan
   └─ Status: SCHEDULED

STEP 4: ADMIN SEND INVITATIONS (BATAS H-3)
   └─ Trigger: Manual atau auto pada H-3 system reminder
   └─ Content Email: Nomor undangan, judul, jadwal, attachment proposal
   └─ Recipient: Semua penguji, dosen pembimbing
   └─ Status: INVITATION_SENT
   └─ VALIDATION: Sistem BLOCK jika < H-3

STEP 5: SEMINAR PROPOSAL DILAKSANAKAN
   └─ Status: START_EXAM → COMPLETED
   └─ Optional: Input nilai, hasil, feedback penguji


STATUS FLOW:

SKP:
  DIJADWALKAN → BERLANGSUNG → SELESAI
  └─ Opt: DITUNDA / BATAL

SEMPRO/SIDANG:
  SUBMITTED_TO_PRODI → EXAMINERS_ASSIGNED → SCHEDULED → INVITATION_SENT 
  → START_EXAM → COMPLETED
  └─ Opt: DITUNDA / BATAL


===========================================
BAGIAN 4: DATA MODELS & DATABASE
===========================================

TABEL UTAMA:

1. users
   ├─ id, email (unique), password_hash (bcrypt)
   ├─ nama, role (IT_ADMIN/ADMIN/PRODI/DOSEN/MAHASISWA)
   ├─ nip (for dosen), nim (for mahasiswa), prodi_id (for prodi coordinator)
   ├─ is_active, created_at, updated_at, created_by
   └─ Indices: email, role, prodi_id

2. schedule_types
   ├─ id, code (SKP/SEMPRO/SIDANG), name, description
   └─ Lookup table - static

3. schedules (MAIN TABLE)
   ├─ id, schedule_type_id (FK), mahasiswa_id (FK), judul, dosen_id (FK)
   ├─ tanggal, jam_mulai, jam_selesai, ruangan, lokasi
   ├─ status (DIJADWALKAN/BERLANGSUNG/SELESAI/SUBMITTED_TO_PRODI/EXAMINERS_ASSIGNED/SCHEDULED/INVITATION_SENT/START_EXAM/COMPLETED/DITUNDA/BATAL)
   ├─ prodi_id (for tracking which prodi manages)
   ├─ deadline_invitation_h_minus_3 (calculated date)
   ├─ catatan, created_at, updated_at, created_by
   └─ Indices: tanggal, dosen_id, mahasiswa_id, status, prodi_id
   └─ Constraint: jam_mulai < jam_selesai

4. examiners
   ├─ id, schedule_id (FK), dosen_id (FK)
   ├─ peran (PEMBIMBING/PENGUJI_1/PENGUJI_2/KETUA_PENGUJI)
   ├─ score, feedback (after exam)
   └─ Unique(schedule_id, dosen_id)

5. invitations
   ├─ id, schedule_id (FK), recipient_id (FK)
   ├─ invitation_type (EXAMINER/SUPERVISOR/STUDENT)
   ├─ sent_at, read_at, status (PENDING/SENT/READ/BOUNCED)
   ├─ email_to, email_subject, email_body
   └─ Useful untuk audit trail

6. attendance (optional)
   ├─ id, schedule_id (FK), user_id (FK)
   ├─ hadir (BOOLEAN), waktu_hadir, keterangan
   └─ Unique(schedule_id, user_id)


===========================================
BAGIAN 5: API ENDPOINTS (30+ endpoints)
===========================================

AUTH: POST /auth/login, POST /auth/logout, GET /auth/me
SCHEDULES: GET/POST/PUT/DELETE /schedules, GET/PATCH status
PROPOSALS: GET/POST/PUT /proposals, PUT sign, GET pdf
EXAMINERS: GET/POST/DELETE /schedules/:id/examiners
PRODI WORKFLOW: POST approve-step-1, assign-examiners, set-schedule, send-invitations
INVITATIONS: GET/PATCH /invitations with read & confirm
USERS: GET/POST/PUT/DELETE /users (IT_ADMIN only)
DASHBOARD: GET /schedules/stats, /proposals/stats, /dashboards/prodi/:id/stats


===========================================
BAGIAN 6: SECURITY & BEST PRACTICES
===========================================

✅ Password hashing dengan bcrypt
✅ JWT token dengan expiry 24 jam
✅ Refresh token mechanism
✅ RBAC di setiap endpoint
✅ Row-level security (Dosen hanya akses jadwal mereka)
✅ SQL injection prevention (parameterized queries)
✅ Input validation & sanitization
✅ CORS configured properly
✅ Rate limiting: 100 req/min per IP
✅ Every change logged dengan user, timestamp, action
✅ Helmet untuk security headers
✅ HTTPS/SSL required di production


===========================================
BAGIAN 7: TECH STACK
===========================================

BACKEND:
- Node.js 18+, Express.js, SQLite3
- jsonwebtoken, bcryptjs, dotenv
- cors, helmet, express-validator
- nodemailer (optional), uuid, moment

FRONTEND:
- React 18+, Vite, React Router v6+
- Axios, Tailwind CSS, React Context
- React Hook Form, date-fns, lucide-react

OPTIONAL:
- Multer (file upload), JSDoc, Jest (testing)


===========================================
BAGIAN 8: KEY FEATURES HIGHLIGHT
===========================================

PRODI COORDINATOR FEATURES:
1. Pending Proposals Management - lihat proposal yang disubmit
2. Examiner Assignment - assign penguji dengan validation
3. Schedule Setting - set jadwal dengan conflict check
4. Invitation Sending - kirim undangan dengan H-3 validation
5. Exam Progress Tracking - dashboard dengan status tracking
6. Result Management - input score & feedback penguji
7. Prodi Statistics - charts & analytics

H-3 VALIDATION:
- System check: invitation harus dikirim >= H-3
- Auto reminder: Prodi di-remind pada H-4
- Block sending jika < H-3 dengan error message
- Count down display di UI

CONFLICT DETECTION:
- Person conflict: Dosen tidak bisa double jadwal
- Location conflict: Ruangan tidak double book
- Show warning & prevent save jika ada conflict


===========================================
BAGIAN 9: PROJECT STRUCTURE
===========================================

BACKEND:
backend/
├── app.js, server.js, package.json, .env, database.db
├── config/, routes/, controllers/, middleware/
├── models/, utils/, scripts/, tests/

FRONTEND:
frontend/
├── index.html, package.json, vite.config.js
├── src/
│   ├── pages/ (Landing, Login, Dashboard*, Schedules*, Proposals*, Users*)
│   ├── components/ (common, schedule, proposal, auth, dashboard)
│   ├── context/ (AuthContext, NotificationContext)
│   ├── api/ (client, auth, schedules, proposals, examiners, users, invitations)
│   ├── utils/, hooks/, assets/, layouts/


===========================================
BAGIAN 10: TESTING SCENARIOS
===========================================

✅ Test SKP workflow: Create → Display → Berlangsung → Selesai
✅ Test SEMPRO full workflow dengan semua 5 steps
✅ Test H-3 validation (block undangan jika < H-3)
✅ Test schedule conflict detection
✅ Test RBAC di semua endpoints dengan berbagai role
✅ Test login dengan semua user types
✅ Test Prodi dashboard & workflow management
✅ Test Mahasiswa proposal submission
✅ Test Dosen examiner input score
✅ Test notifications & email sending


===========================================
REQUIREMENTS UNTUK CLAUDE
===========================================

DELIVER COMPLETE, PRODUCTION-READY CODE:

✅ Backend: All routes, controllers, models, middleware
✅ Frontend: All pages, components, styling complete
✅ Database: Complete schema + seed script
✅ Config: .env.example, vite.config, tailwind.config
✅ Docs: README, setup guide, API docs
✅ Security: Proper auth, validation, CORS, rate limiting
✅ Error Handling: Meaningful messages, proper HTTP codes
✅ Code Quality: Clean, commented, DRY, consistent
✅ UI/UX: Responsive, intuitive, accessible
✅ Test Data: Sample users & schedules for testing

BUILD NOW! Implement dengan best practices & production standards.
```

---

## END OF PROMPT

---

## CARA MENGGUNAKAN

1. **Copy seluruh prompt** antara triple backticks
2. **Paste ke Claude Opus 4.6**
3. **Wait untuk Claude generate** complete codebase
4. **Claude akan output:**
   - ✅ Backend lengkap
   - ✅ Frontend lengkap
   - ✅ Database schema
   - ✅ Configuration files
   - ✅ Documentation

---

## PERUBAHAN UTAMA DARI REQUEST

✅ Workflow SEMPRO dengan 5 steps dari gambar  
✅ H-3 validation untuk undangan  
✅ Prodi coordinator role & dashboard  
✅ Examiner assignment system  
✅ Full academic workflow  
✅ Comprehensive prompt untuk Claude Opus 4.6  

**Prodi Workflow Detail:**
1. Mahasiswa submit → Prodi assign penguji
2. Prodi set jadwal → auto-calculate H-3
3. Prodi send undangan (>=H-3) dengan attachment
4. Penguji & mahasiswa terima undangan
5. Seminar executed sesuai jadwal

**H-3 Validation:**
- System reminder H-4 ke Prodi
- Block undangan jika < H-3
- Show countdown di UI
- Validated saat send invitation
