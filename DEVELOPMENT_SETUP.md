# Development Setup Guide

Panduan untuk setup development environment untuk Sistem Jadwal Seminar & Sidang.

---

## Prerequisites

Sebelum memulai, pastikan sudah install:

### Global Requirements
- **Git** 2.30+
- **Node.js** 18+ (atau Python 3.9+ jika menggunakan backend Python)
- **npm** 8+ (atau pnpm/yarn)
- **SQLite3** (optional, included via npm package)

### Recommended Tools
- **VS Code** dengan extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - SQLite (untuk browse database)
  - REST Client (untuk test API)
  - Tailwind CSS IntelliSense

---

## 1. Clone Repository

```bash
# Clone dari GitHub
git clone https://github.com/otomasi-obe/SeminarSidang.git
cd SeminarSidang

# Checkout ke branch v1 (sudah default)
git checkout v1

# Atau langsung jika v1 sudah default
git pull origin v1
```

---

## 2. Backend Setup

### 2.1 Node.js + Express Backend

```bash
# Navigate ke backend
cd backend

# Install dependencies
npm install

# Atau gunakan pnpm untuk lebih cepat
pnpm install
```

### 2.2 Environment Variables

Create `.env` file di folder backend:

```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=./database.db

# JWT
JWT_SECRET=your_jwt_secret_key_here_min_32_characters
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 2.3 Database Initialization

```bash
# Run database migration/seeding script
npm run db:init

# Atau manual jika tidak ada script
node scripts/init-db.js
```

Ini akan create:
- `backend/database.db` (file database)
- Semua tables dengan data default

### 2.4 Verify Backend Setup

```bash
# Start development server
npm run dev

# Expected output:
# Server running on http://localhost:3000
# Database connected: ./database.db
```

Test API:
```bash
curl http://localhost:3000/api/schedule-types

# Expected response:
# {
#   "success": true,
#   "data": [
#     {"id": 1, "code": "SKP", "name": "Seminar Kerja Praktik"},
#     ...
#   ]
# }
```

### 2.5 Backend Project Structure

```
backend/
├── app.js                 # Express app entry point
├── server.js              # Server runner
├── package.json
├── .env                   # Local environment (git ignored)
├── .env.example           # Template
├── database.db            # SQLite database (generated)
├── scripts/
│   └── init-db.js         # Database initialization
├── routes/
│   ├── auth.js
│   ├── schedules.js
│   ├── users.js
│   └── index.js
├── controllers/
│   ├── authController.js
│   ├── scheduleController.js
│   └── userController.js
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── errorHandler.js
│   └── rbac.js            # Role-based access
├── models/
│   ├── User.js
│   ├── Schedule.js
│   └── db.js              # Database connection
├── utils/
│   ├── validator.js
│   └── logger.js
└── tests/
    └── api.test.js
```

---

## 3. Frontend Setup

### 3.1 React + Vite

```bash
# Navigate ke frontend
cd frontend

# Install dependencies
npm install

# Atau pnpm
pnpm install
```

### 3.2 Environment Variables

Create `.env` file di folder frontend:

```bash
# Create from template
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME="Sistem Jadwal Seminar & Sidang"
VITE_APP_VERSION=1.0.0
```

### 3.3 Start Development Server

```bash
# Start frontend dev server
npm run dev

# Expected output:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### 3.4 Access Application

Buka browser dan navigate ke:
```
http://localhost:5173
```

Anda seharusnya melihat landing page dengan jadwal kosong (karena belum ada data).

### 3.5 Frontend Project Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env
├── .env.example
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx           # Entry point
│   ├── App.jsx            # Main component
│   ├── index.css          # Global styles
│   ├── pages/
│   │   ├── Landing.jsx    # Public landing page
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── NotFound.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ScheduleTable.jsx
│   │   ├── ScheduleForm.jsx
│   │   └── UserForm.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ScheduleContext.jsx
│   ├── api/
│   │   └── client.js      # Axios instance
│   ├── utils/
│   │   ├── formatDate.js
│   │   └── helpers.js
│   └── assets/            # Images, fonts, etc
```

---

## 4. Database Setup & Verification

### 4.1 View Database

Using SQLite CLI:
```bash
sqlite3 backend/database.db

# Inside SQLite:
.tables                    # List all tables
SELECT * FROM schedule_types;
SELECT * FROM users;
.exit                      # Exit
```

Or use VS Code SQLite extension:
1. Open Command Palette (Ctrl+Shift+P)
2. Search "SQLite: Open Database"
3. Select `backend/database.db`
4. Browse tables in explorer

### 4.2 Sample Data

Insert test data untuk development:

```bash
# Ggunakan script untuk insert sample data
npm run db:seed

# Atau manual insert via VS Code SQLite extension
```

Sample users yang akan di-create:
```
Email: itadmin@university.edu || Pass: admin123 || Role: IT_ADMIN
Email: admin@university.edu   || Pass: admin123 || Role: ADMIN
Email: dosen@university.edu   || Pass: admin123 || Role: DOSEN (NIP: 198501101234567)
Email: mhs@university.edu     || Pass: admin123 || Role: MAHASISWA (NIM: 21001234)
```

⚠️ **PENTING**: Change password di production!

---

## 5. Full Development Workflow

### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Server running on http://localhost:3000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# App running on http://localhost:5173
```

### Workflow
1. Buka 2 terminal
2. Start backend (Terminal 1)
3. Start frontend (Terminal 2)
4. Buka http://localhost:5173 di browser
5. Create dan manage jadwal

---

## 6. Testing API

### Using REST Client (VS Code)

Create file `backend/requests.http`:

```http
### Get all schedules (public)
GET http://localhost:3000/api/schedules

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "dosen@university.edu",
  "password": "admin123"
}

### Get current user (setelah login)
GET http://localhost:3000/api/auth/me
Authorization: Bearer {token_dari_login}

### Get all schedule types
GET http://localhost:3000/api/schedule-types

### Create schedule
POST http://localhost:3000/api/schedules
Authorization: Bearer {token}
Content-Type: application/json

{
  "schedule_type": "SKP",
  "mahasiswa_id": 4,
  "judul": "Sistem Monitoring IoT",
  "dosen_id": 3,
  "tanggal": "2024-03-20",
  "jam_mulai": "10:00:00",
  "jam_selesai": "12:00:00",
  "ruangan": "Lab Komputer 1"
}
```

Click "Send Request" di VS Code untuk test setiap endpoint.

---

## 7. Common Issues & Solutions

### Issue 1: Port 3000 Sudah Terpakai
```bash
# Change port di .env
PORT=3001

# Atau kill process yang pakai port 3000
lsof -i :3000        # Mac/Linux
netstat -ano | findstr :3000  # Windows
kill -9 <PID>        # Kill process
```

### Issue 2: Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Database File Not Found
```bash
# Reinitialize database
npm run db:init
```

### Issue 4: CORS Error di Frontend
Pastikan backend `.env` memiliki:
```env
CORS_ORIGIN=http://localhost:5173
```

### Issue 5: JWT Token Error
Pastikan backend memiliki JWT_SECRET di `.env`:
```env
JWT_SECRET=your_secret_min_32_chars_long_enough
```

---

## 8. Useful Development Commands

### Backend Commands
```bash
npm run dev          # Start dev server with auto-reload
npm run start        # Start production server
npm run db:init      # Initialize database
npm run db:seed      # Seed sample data
npm run db:reset     # Reset database (delete all data)
npm run test         # Run tests
npm run lint         # Run linter
```

### Frontend Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

---

## 9. Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ...

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Commit Message Format
```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

---

## 10. Debugging Tips

### Backend Debugging
```javascript
// Add console.logs
console.log('Request body:', req.body);
console.log('User:', req.user);

// Or use debugger
// node --inspect app.js
// Then open chrome://inspect in Chrome
```

### Frontend Debugging
```javascript
// React DevTools Chrome extension
// Vue DevTools (if using Vue)
// Open DevTools (F12) → Console for errors
// Network tab untuk lihat API calls
```

### Database Debugging
```bash
# View database structure
sqlite3 ./database.db ".schema"

# Export database query
sqlite3 ./database.db "SELECT * FROM schedules;" > output.csv

# Backup database
cp database.db database.backup.db
```

---

## 11. Next Steps After Setup

1. ✅ Verify backend running on `http://localhost:3000`
2. ✅ Verify frontend running on `http://localhost:5173`
3. ✅ Login dengan test user credentials
4. ✅ Create test schedule
5. ✅ Verify schedule appears di landing page
6. ✅ Test create/edit/delete jadwal
7. ✅ Test different roles (Admin, Dosen, Mahasiswa)

---

## 12. Deployment Preparation

Sebelum production, persiapkan:

```bash
# Build frontend
cd frontend
npm run build
# Output folder: frontend/dist/

# Backend ready (tinggal deploy)
cd backend
# Pastikan .env production sudah siap

# Create production database
npm run db:init -- --prod
```

Lihat `DEPLOYMENT.md` untuk detail deployment steps.

---

## Quick Reference

| Task | Command |
|------|---------|
| Start Backend | `cd backend && npm run dev` |
| Start Frontend | `cd frontend && npm run dev` |
| Init Database | `cd backend && npm run db:init` |
| View Database | `sqlite3 backend/database.db` |
| Test API | Open `requests.http` in VS Code |
| Build Frontend | `cd frontend && npm run build` |
| Run Tests | `npm test` |

---

**Troubleshooting?** Check these files:
- Backend issues → Check `backend/.env` & logs
- Frontend issues → Check `frontend/.env` & browser console
- Database issues → Use SQLite extension or CLI

**Questions?** Refer to:
- `PROJECT_SPEC.md` - What to build
- `API_ENDPOINTS.md` - API reference
- `DATABASE_SCHEMA.md` - Database design
- `SYSTEM_OVERVIEW.md` - System architecture
