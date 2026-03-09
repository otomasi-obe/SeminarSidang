# Sistem Jadwal Seminar & Sidang

Sistem Informasi Web untuk manajemen jadwal akademik di institusi pendidikan, mencakup Seminar Kerja Praktik (SKP), Seminar Proposal Tugas Akhir (SEMPRO), dan Sidang Tugas Akhir.

## 🎯 Tujuan Sistem

- Centralize jadwal akademik dalam satu platform
- Facilitate penjadwalan oleh dosen dan admin
- Provide visibility kepada semua stakeholder (mahasiswa, dosen, publik)
- Streamline manajemen user dan permissions

---

## 📚 Dokumentasi

Repository ini berisi dokumentasi lengkap untuk sistem:

### 1. **[SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)** ⭐ START HERE
   - Deskripsi lengkap sistem
   - Stakeholders & user types
   - Main features overview
   - Data flow diagram
   - Workflow scenarios

### 2. **[PROJECT_SPEC.md](PROJECT_SPEC.md)**
   - Spesifikasi requirements
   - User roles & permissions
   - Tech stack recommendations
   - Timeline development
   - Folder structure

### 3. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)**
   - Design database lengkap
   - Tabel & relationships
   - Entity relationship diagram (ERD)
   - SQL queries
   - Migration instructions

### 4. **[API_ENDPOINTS.md](API_ENDPOINTS.md)**
   - Complete API documentation
   - Authentication endpoints
   - Schedule management endpoints
   - User management endpoints
   - Error responses

### 5. **[USER_ROLES.md](USER_ROLES.md)**
   - Role definitions & permissions
   - Permission matrix
   - API endpoint permissions
   - Implementation guidelines
   - Security notes

### 6. **[DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md)** 👨‍💻
   - Setup development environment
   - Backend setup (Node.js + Express + SQLite)
   - Frontend setup (React + Vite + Tailwind)
   - Database initialization
   - Debugging tips
   - Git workflow

### 7. **[PROMPT_CLAUDE_OPUS.md](PROMPT_CLAUDE_OPUS.md)** 🤖
   - Comprehensive prompt untuk Claude Opus
   - Siap untuk generate complete codebase
   - Development checklist
   - Deliverables specification

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/pnpm
- Git
- SQLite3 (optional)

### Setup Backend
```bash
cd backend
npm install
npm run db:init
npm run dev
# Server running on http://localhost:3000
```

### Setup Frontend
```bash
cd frontend
npm install
npm run dev
# App running on http://localhost:5173
```

### Access Application
Open browser: `http://localhost:5173`

**Default Test Users:**
- IT Admin: `itadmin@university.edu` / `admin123`
- Admin: `admin@university.edu` / `admin123`
- Dosen: `dosen@university.edu` / `admin123`
- Mahasiswa: `mhs@university.edu` / `admin123`

⚠️ *Note: Change passwords di production!*

---

## 📁 Folder Structure

```
SeminarSidang/
├── README.md                    # Project overview
├── .gitignore                   # Git ignore rules
├── PROJECT_SPEC.md              # Project specification
├── DATABASE_SCHEMA.md           # Database design
├── API_ENDPOINTS.md             # API documentation
├── USER_ROLES.md                # Roles & permissions
├── SYSTEM_OVERVIEW.md           # System overview & architecture
├── DEVELOPMENT_SETUP.md         # Development guide
├── PROMPT_CLAUDE_OPUS.md        # Claude Opus prompt
│
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── api/               # API client
│   │   ├── context/           # React context
│   │   ├── utils/             # Utility functions
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Node.js + Express backend
│   ├── routes/                 # API routes
│   ├── controllers/            # Business logic
│   ├── models/                 # Database models
│   ├── middleware/             # Express middleware
│   ├── scripts/                # Database scripts
│   ├── utils/                  # Utility functions
│   ├── app.js                  # Express app
│   ├── server.js               # Server entry
│   ├── database.db             # SQLite database
│   ├── package.json
│   ├── .env                    # Environment variables
│   └── .env.example            # Environment template
│
└── docs/                        # Additional documentation
    ├── SETUP.md                # Setup guide
    ├── DEPLOYMENT.md           # Deployment guide
    └── TROUBLESHOOTING.md      # Troubleshooting
```

---

## 🔑 Key Features

| Feature | Public | Student | Dosen | Admin | IT Admin |
|---------|--------|---------|-------|-------|----------|
| View Landing Page | ✅ | ✅ | ✅ | ✅ | ✅ |
| Login | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create Schedule | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit Schedule | ❌ | ❌ | ✅* | ✅ | ✅ |
| Delete Schedule | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ |

*Dosen hanya bisa edit jadwal yang mereka buat

---

## 💻 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **Environment**: dotenv

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6+
- **State Management**: React Context API

### DevOps
- **Version Control**: Git
- **Package Manager**: npm/pnpm
- **Development**: Nodemon

---

## 🛠 Useful Commands

### Backend
```bash
npm run dev              # Start dev server
npm run start            # Start production
npm run db:init          # Initialize database
npm run db:seed          # Seed sample data
npm run db:reset         # Reset database
npm test                 # Run tests
```

### Frontend
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build
npm run lint             # Run linter
```

---

## 🔐 Security Features

- ✅ Password hashing dengan bcrypt
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Audit trail (created_by, timestamps)

---

## 📖 Documentation Guide

**New to the project?** Start here:
1. Read [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) - Understand system architecture
2. Read [PROJECT_SPEC.md](PROJECT_SPEC.md) - Understand requirements
3. Follow [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) - Setup development
4. Reference [API_ENDPOINTS.md](API_ENDPOINTS.md) - API documentation
5. Reference [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database design

**For Development:**
- Use [PROMPT_CLAUDE_OPUS.md](PROMPT_CLAUDE_OPUS.md) to generate code
- Use [USER_ROLES.md](USER_ROLES.md) for permission logic
- Use [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) for troubleshooting

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: add your feature"`
3. Push to GitHub: `git push origin feature/your-feature`
4. Create Pull Request

### Commit Message Format
- `feat:` untuk feature baru
- `fix:` untuk bug fixes
- `docs:` untuk dokumentasi
- `style:` untuk formatting
- `refactor:` untuk refactoring code
- `test:` untuk test files
- `chore:` untuk dependencies

---

## 📝 License

MIT License - Feel free to use for educational and commercial purposes.

---

## 👥 Team

Repository: **otomasi-obe/SeminarSidang**  
Organization: **otomasi-obe**  
Branch: **v1** (default)

---

## ❓ FAQ

**Q: Bagaimana cara mulai development?**  
A: Baca [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) dan ikuti langkah-langkahnya.

**Q: Apa tech stack yang digunakan?**  
A: Node.js + Express + SQLite untuk backend, React + Vite + Tailwind untuk frontend.

**Q: Bagaimana cara deploy ke production?**  
A: Check documentation di folder `docs/` atau lihat `PROMPT_CLAUDE_OPUS.md`.

**Q: Bagaimana role-based access control bekerja?**  
A: Lihat [USER_ROLES.md](USER_ROLES.md) untuk dokumentasi lengkap.

**Q: Bagaimana database structure?**  
A: Lihat [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) untuk ERD dan SQL.

---

## 📞 Support

- Check [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) for common issues
- Review API documentation in [API_ENDPOINTS.md](API_ENDPOINTS.md)
- Check database design in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

---

## 🎉 Status

- ✅ Documentation complete
- ✅ Database schema finalized
- ✅ API design finalized
- ✅ Requirements specified
- ⏳ Backend implementation (use PROMPT_CLAUDE_OPUS.md)
- ⏳ Frontend implementation (use PROMPT_CLAUDE_OPUS.md)
- ⏳ Testing & deployment

Last Updated: March 2024  
Repository: https://github.com/otomasi-obe/SeminarSidang
