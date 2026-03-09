# System Overview - Sistem Jadwal Seminar & Sidang

## 1. Deskripsi Singkat Sistem

Sistem Informasi Web untuk manajemen jadwal akademik (Seminar Kerja Praktik, Seminar Proposal, dan Sidang Tugas Akhir) di lingkungan universitas/institusi pendidikan.

### Tujuan Sistem:
- Centralize jadwal akademik
- Facilitate penjadwalan oleh dosen/admin
- Provide visibility kepada semua stakeholder (mahasiswa, dosen, publik)
- Streamline manajemen user dan permissions

---

## 2. Stakeholders & User Types

```
INSTITUSI
    │
    ├─ IT ADMIN
    │   └─ System maintenance, user management, full access
    │
    ├─ ADMIN (Akademik)
    │   └─ Manage jadwal, create schedules, status updates
    │
    ├─ DOSEN (Pembimbing Akademik)
    │   └─ Create/edit jadwal untuk mahasiswa bimbingan
    │
    └─ MAHASISWA
        └─ View jadwal pribadi dan jadwal publik
    
    PUBLIK (Tanpa Login)
    └─ View landing page dengan jadwal publik
```

---

## 3. Main Features

### A. LANDING PAGE (Public Access)
```
┌─────────────────────────────────────────────────┐
│  SISTEM INFORMATIKA JADWAL SEMINAR & SIDANG     │
├─────────────────────────────────────────────────┤
│                                          [Login] │
├─────────────────────────────────────────────────┤
│ Filter: [Jenis▾] [Dosen▾] [Tanggal▾] [Search] │
├─────────────────────────────────────────────────┤
│ JADWAL SEMINAR & SIDANG                         │
├─────────────────────────────────────────────────┤
│ Tanggal    │ Jenis │ Dosen │ Mahasiswa │ Judul │
├─────────────────────────────────────────────────┤
│ 15/03/24   │ SKP   │ Dr. Budi │ Andi Wijaya │ │
│ 10:00-12:00│       │          │ (21001234)   │ │
│ Ruang: Lab │       │          │              │ │
├─────────────────────────────────────────────────┤
│ 16/03/24   │SEMPRO │ Prof. Siti  │ Budi Santoso│
│ 14:00-16:00│       │             │ (21001233)   │
└─────────────────────────────────────────────────┘
```

### B. AUTHENTICATION
- Login dengan email/password
- JWT token-based untuk session management
- Password hashing dengan bcrypt
- Role-based access after login

### C. SCHEDULE MANAGEMENT
**Create Schedule:**
- Dosen/Admin input: type, mahasiswa, judul, tanggal, jam, ruangan
- System check untuk konflik jadwal
- Save ke database

**View Schedules:**
- Landing page: semua jadwal (public)
- Dashboard: filtered berdasarkan role
- Search, sort, filter functionality

**Update Schedule:**
- Edit waktu, lokasi, status
- Only by: original creator, ADMIN, IT_ADMIN

**Delete Schedule:**
- Only by: ADMIN, IT_ADMIN
- Soft delete recommended (status = BATAL)

### D. USER MANAGEMENT (IT Admin only)
- Create user dengan role: DOSEN, MAHASISWA, ADMIN
- Edit user profile
- Deactivate user (soft delete)
- View user list dengan pagination

### E. DASHBOARD
Berbeda sesuai role:

**IT Admin Dashboard:**
- User management interface
- System statistics
- Audit logs
- Database backup options

**Admin Dashboard:**
- Schedule management (CRUD)
- Schedule statistics
- Create schedule form
- Manage all schedules

**Dosen Dashboard:**
- My schedules (yang dibuat)
- Create schedule form
- View all schedules
- Dashboard stats (my schedules only)

**Mahasiswa Dashboard:**
- My schedules (sebagai mahasiswa)
- View all schedules (read-only)
- Filter jadwal

---

## 4. Data Flow Diagram

```
┌──────────────────────────────────────────────────────┐
│           SISTEM JADWAL SEMINAR & SIDANG             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐                  ┌──────────────┐ │
│  │  Frontend    │                  │   Backend    │ │
│  │  (React)     │◄────────────────►│  (Express/   │ │
│  │              │   HTTP/JSON      │   FastAPI)   │ │
│  └──────────────┘                  └──────────────┘ │
│                                           │          │
│                                           │          │
│                                    ┌──────▼────────┐ │
│                                    │ Database      │ │
│                                    │ (SQLite)      │ │
│                                    │ database.db   │ │
│                                    ├───────────────┤ │
│                                    │ • users       │ │
│                                    │ • schedules   │ │
│                                    │ • types       │ │
│                                    │ • attendance  │ │
│                                    └───────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Frontend Data Flow:
```
User Visit → Landing Page (Public) 
                ↓
        Login (optional) 
                ↓
        Dashboard (Role-specific) 
                ↓
        View/Create/Edit Schedules 
                ↓
        (Update displayed data)
```

### Backend Data Flow:
```
HTTP Request → Middleware (Auth/CORS)
                ↓
        Route Handler
                ↓
        Controller (Business Logic)
                ↓
        Database Query
                ↓
        Response (JSON)
```

---

## 5. Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js (atau FastAPI untuk Python)
- **Database**: SQLite3
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Environment**: dotenv

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6+
- **State Management**: Context API (atau Redux)

### DevOps
- **Version Control**: Git
- **Package Manager**: npm/pnpm
- **Development**: nodemon (auto-reload)

---

## 6. Key Features Matrix

| Feature | IT Admin | Admin | Dosen | Mahasiswa |
|---------|----------|-------|-------|-----------|
| Login | ✅ | ✅ | ✅ | ✅ |
| View Landing Page | ✅ | ✅ | ✅ | ✅ |
| create Schedule | ✅ | ✅ | ✅ | ❌ |
| Edit Schedule | ✅ | ✅ | ✅* | ❌ |
| Delete Schedule | ✅ | ✅ | ❌ | ❌ |
| Create User | ✅ | ❌ | ❌ | ❌ |
| View Users | ✅ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Export Jadwal | ✅ | ✅ | ✅ | ✅ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

*Dosen hanya bisa edit jadwal yang mereka buat

---

## 7. Workflow Scenarios

### Scenario 1: Dosen Membuat Jadwal Baru
```
1. Dosen login dengan email/password
2. Masuk ke dashboard Dosen
3. Klik "Buat Jadwal Baru"
4. Isi form: tipe (SEMPRO), mahasiswa, judul, tanggal, jam
5. Submit → Sistem check konflik
6. Success → Jadwal appears di landing page
7. Mahasiswa menerima notifikasi (optional)
```

### Scenario 2: Admin Mengelola Jadwal
```
1. Admin login
2. View "Manajemen Jadwal"
3. Daftar semua jadwal yang ada
4. Click 1 jadwal → See details
5. Edit waktu jika ada change
6. Update status (DIJADWALKAN → SELESAI)
7. Changes appear in real-time di landing page
```

### Scenario 3: IT Admin Membuat User Baru
```
1. IT Admin ke "User Management"
2. Click "Tambah User Baru"
3. Isi: email, nama, role (DOSEN/MAHASISWA), NIP/NIM
4. Generate temp password
5. User invited via email
6. User login with temp password → prompt change password
```

### Scenario 4: Mahasiswa Melihat Jadwal
```
1. Mahasiswa login
2. Dashboard Mahasiswa muncul
3. Lihat "Jadwal Saya" section
4. See jadwal yang mereka miliki sebagai peserta
5. Juga bisa view "Semua Jadwal" (read-only)
6. Filter berdasarkan jenis, dosen, atau tanggal
```

### Scenario 5: Public Visitor Melihat Landing Page
```
1. User akses website (tanpa login)
2. Landing page tampil dengan jadwal publik
3. Lihat tabel jadwal dengan filter
4. Click "Detail" untuk melihat info lengkap
5. Klik "Login" untuk akses fitur lanjutan
```

---

## 8. Status Jadwal Lifecycle

```
        │
        ▼
    ┌─────────────────┐
    │ DIJADWALKAN     │ ◄─── Initial state ketika created
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ BERLANGSUNG     │ ◄─── When event is ongoing (manual update)
    └────────┬────────┘
             │
             ├─────────────┐
             │             │
             ▼             ▼
    ┌──────────────┐  ┌──────────────┐
    │ SELESAI      │  │ DITUNDA      │ ◄─── Postponed/rescheduled
    └──────────────┘  └──────────────┘
                              │
             ┌────────────────┘
             │
             ▼
    ┌──────────────────┐
    │ BATAL            │ ◄─── Cancelled (soft delete)
    └──────────────────┘

Admin atau Dosen dapat mengubah status sesuai kebutuhan.
```

---

## 9. Security Considerations

1. **Authentication**
   - JWT token per user
   - Token expiry: 24 jam
   - Refresh token optional

2. **Authorization**
   - RBAC di setiap endpoint
   - Dosen hanya bisa edit jadwal mereka
   - Database query filtered by user role

3. **Data Protection**
   - Password hashed dengan bcrypt
   - Input validation di backend
   - SQL injection prevention (parameterized queries)
   - CORS configured untuk domain tertentu
   - Rate limiting: 100 req/minute per IP

4. **Audit Trail**
   - Track created_by, created_at, updated_at
   - Log setiap create/update/delete
   - Admin bisa view activity logs

---

## 10. Performance Considerations

1. **Database**
   - Index pada: tanggal, dosen_id, mahasiswa_id, status
   - Pagination untuk list endpoints (default 50 per page)

2. **API**
   - Implement caching untuk GET /schedule-types
   - JWT token validation via middleware

3. **Frontend**
   - Lazy loading untuk gambar
   - Memoization untuk heavy components
   - Debounce untuk search input

---

## 11. Deployment Architecture

```
┌─────────────────────────────────────────────┐
│          PRODUCTION ENVIRONMENT             │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (Static):                         │
│  ├─ React build output                      │
│  └─ Hosting: Nginx / Apache / CDN           │
│                                             │
│  Backend (Dynamic):                         │
│  ├─ Node.js Express server                  │
│  ├─ Running on port 3000 (or via Nginx)    │
│  └─ Process manager: PM2                    │
│                                             │
│  Database:                                  │
│  ├─ SQLite database.db file                 │
│  ├─ Backup: Daily or on event               │
│  └─ Location: `/var/data/` or `/backend/`   │
│                                             │
│  Reverse Proxy:                             │
│  ├─ Nginx dengan SSL/TLS                    │
│  ├─ Load balancing (if multiple servers)    │
│  └─ CORS headers configuration              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 12. Development Guidelines

1. **Folder Structure**: Ikuti struktur yang sudah direncanakan
2. **API Response Format**: Consistent JSON format dengan `success`, `message`, `data`
3. **Error Handling**: Try-catch mekanisme, meaningful error messages
4. **Logging**: Console logs untuk development, file logs untuk production
5. **Testing**: Unit tests untuk utils, integration tests untuk API
6. **Documentation**: Comment pada function kompleks, API docs di README

---

## 13. Maintenance & Future Enhancements

### Short Term (v1.0)
- Core CRUD functionality
- Basic authentication
- Landing page display

### Medium Term (v1.1)
- Email notifications
- Schedule export (CSV/PDF)
- Dashboard analytics
- Attendance tracking

### Long Term (v2.0)
- Mobile app
- Calendar integration
- Video conferencing integration
- Automated conflict detection
- Machine learning untuk optimal scheduling

---

## 14. Key Metrics & KPIs

- **Uptime**: Target 99.5%
- **Response Time**: < 200ms untuk GET, < 500ms untuk POST
- **User Load**: Support 1000+ concurrent users
- **Database Size**: < 1GB typical usage
- **Documentation**: 100% API endpoints covered

---

## Quick Summary

✅ **What**: Web system untuk manajemen jadwal akademik  
✅ **Who**: Institusi pendidikan (universitas)  
✅ **When**: Real-time, accessible 24/7  
✅ **Where**: Cloud atau on-premise server  
✅ **Why**: Centralize scheduling, improve efficiency  
✅ **How**: Web application dengan backend API + SQLite DB  

---

**Next Steps:**
1. Review dokumentasi ini dengan team
2. Setup backend & frontend folders
3. Initialize git repositories
4. Setup development environment
5. Begin implementation menggunakan PROMPT_CLAUDE_OPUS.md

---

**Questions or clarifications?** Lihat file dokumentasi detail:
- `PROJECT_SPEC.md` - Spesifikasi detil
- `DATABASE_SCHEMA.md` - Database design
- `API_ENDPOINTS.md` - API reference
- `USER_ROLES.md` - Roles & permissions
