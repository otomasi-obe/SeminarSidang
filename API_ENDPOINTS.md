# API Endpoints Documentation

Base URL: `http://localhost:3000/api` (atau sesuai deployment)

## Authentication

### 1. Login
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "dosen@university.edu",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "dosen@university.edu",
      "nama": "Dr. Budi Santoso",
      "role": "DOSEN",
      "nip": "198501101234567"
    }
  }
}

Response (401):
{
  "success": false,
  "message": "Email atau password salah"
}
```

### 2. Logout
```
POST /auth/logout
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Logout berhasil"
}
```

### 3. Get Current User
```
GET /auth/me
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "email": "dosen@university.edu",
    "nama": "Dr. Budi Santoso",
    "role": "DOSEN",
    "nip": "198501101234567",
    "is_active": true
  }
}
```

---

## User Management

### 4. Create User (IT Admin only)
```
POST /users
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "email": "newuser@university.edu",
  "password": "temporaryPassword123",
  "nama": "Nama User Baru",
  "role": "DOSEN",  // DOSEN, MAHASISWA, ADMIN
  "nip": "198601011234567",  // untuk DOSEN
  "nim": "21001234"  // untuk MAHASISWA
}

Response (201):
{
  "success": true,
  "message": "User berhasil dibuat",
  "data": {
    "id": 5,
    "email": "newuser@university.edu",
    "nama": "Nama User Baru",
    "role": "DOSEN"
  }
}

Response (403):
{
  "success": false,
  "message": "Hanya IT Admin yang bisa membuat user"
}
```

### 5. Get All Users (IT Admin only)
```
GET /users
Authorization: Bearer {token}

Query Parameters:
- role: DOSEN | MAHASISWA | ADMIN | IT_ADMIN (optional)
- is_active: true | false (optional)
- limit: number (default 20)
- offset: number (default 0)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "dosen@university.edu",
      "nama": "Dr. Budi Santoso",
      "role": "DOSEN",
      "nip": "198501101234567",
      "is_active": true,
      "created_at": "2024-03-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

### 6. Get User Detail
```
GET /users/:id
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "email": "dosen@university.edu",
    "nama": "Dr. Budi Santoso",
    "role": "DOSEN",
    "nip": "198501101234567",
    "is_active": true
  }
}
```

### 7. Update User (IT Admin/Self)
```
PUT /users/:id
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "nama": "Dr. Budi Santoso (Update)",
  "password": "newPassword123"  // optional
}

Response (200):
{
  "success": true,
  "message": "User berhasil diupdate",
  "data": {
    "id": 1,
    "email": "dosen@university.edu",
    "nama": "Dr. Budi Santoso (Update)",
    "role": "DOSEN"
  }
}
```

### 8. Deactivate User (IT Admin only)
```
DELETE /users/:id
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "User berhasil dinonaktifkan"
}
```

---

## Schedule Management

### 9. Get All Schedules (Public - Landing Page)
```
GET /schedules
Authorization: (optional - without auth shows public data)

Query Parameters:
- type: SKP | SEMPRO | SIDANG (optional)
- dosen_id: number (optional)
- mahasiswa_id: number (optional)
- status: DIJADWALKAN | BERLANGSUNG | SELESAI | DITUNDA | BATAL (optional)
- tanggal_from: YYYY-MM-DD (optional)
- tanggal_to: YYYY-MM-DD (optional)
- limit: number (default 50)
- offset: number (default 0)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "jenis": "SKP",
      "jenis_nama": "Seminar Kerja Praktik",
      "tanggal": "2024-03-15",
      "jam_mulai": "10:00:00",
      "jam_selesai": "12:00:00",
      "dosen": "Dr. Budi Santoso",
      "dosen_id": 1,
      "mahasiswa": "Andi Wijaya",
      "mahasiswa_id": 10,
      "nim": "21001234",
      "judul": "Sistem Monitoring Berbasis IoT",
      "ruangan": "Lab Komputer 1",
      "lokasi": "Gedung B, Lantai 3",
      "status": "DIJADWALKAN"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

### 10. Get Schedule Detail
```
GET /schedules/:id
Authorization: (optional)

Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "jenis": "SKP",
    "tanggal": "2024-03-15",
    "jam_mulai": "10:00:00",
    "jam_selesai": "12:00:00",
    "dosen": "Dr. Budi Santoso",
    "dosen_id": 1,
    "mahasiswa": "Andi Wijaya",
    "mahasiswa_id": 10,
    "judul": "Sistem Monitoring Berbasis IoT",
    "ruangan": "Lab Komputer 1",
    "status": "DIJADWALKAN",
    "catatan": "Pastikan membawa dokumentasi lengkap",
    "created_at": "2024-03-01T10:00:00Z",
    "updated_by": "admin@university.edu"
  }
}
```

### 11. Create Schedule (Dosen/Admin/IT Admin)
```
POST /schedules
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "schedule_type": "SKP",  // SKP | SEMPRO | SIDANG
  "mahasiswa_id": 10,
  "judul": "Sistem Monitoring Berbasis IoT",
  "dosen_id": 1,  // dosen pembimbing
  "tanggal": "2024-03-15",
  "jam_mulai": "10:00:00",
  "jam_selesai": "12:00:00",
  "ruangan": "Lab Komputer 1",
  "lokasi": "Gedung B, Lantai 3",
  "catatan": "Pastikan membawa dokumentasi lengkap"
}

Response (201):
{
  "success": true,
  "message": "Jadwal berhasil dibuat",
  "data": {
    "id": 1,
    "schedule_type": "SKP",
    "mahasiswa_id": 10,
    "judul": "Sistem Monitoring Berbasis IoT",
    "dosen_id": 1,
    "tanggal": "2024-03-15",
    "status": "DIJADWALKAN"
  }
}

Response (400):
{
  "success": false,
  "message": "Data tidak valid"
}

Response (409):
{
  "success": false,
  "message": "Jadwal bentrok dengan jadwal yang sudah ada"
}
```

### 12. Update Schedule (Dosen/Admin/IT Admin)
```
PUT /schedules/:id
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "tanggal": "2024-03-16",
  "jam_mulai": "14:00:00",
  "jam_selesai": "16:00:00",
  "ruangan": "Lab Komputer 2",
  "status": "DIJADWALKAN"
}

Response (200):
{
  "success": true,
  "message": "Jadwal berhasil diupdate",
  "data": {
    "id": 1,
    "tanggal": "2024-03-16",
    "jam_mulai": "14:00:00"
  }
}
```

### 13. Delete Schedule (Admin/IT Admin only)
```
DELETE /schedules/:id
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Jadwal berhasil dihapus"
}
```

### 14. Update Schedule Status
```
PATCH /schedules/:id/status
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "status": "SELESAI"  // DIJADWALKAN | BERLANGSUNG | SELESAI | DITUNDA | BATAL
}

Response (200):
{
  "success": true,
  "message": "Status jadwal berhasil diupdate",
  "data": {
    "id": 1,
    "status": "SELESAI"
  }
}
```

---

## Schedule Types

### 15. Get Schedule Types
```
GET /schedule-types
Authorization: (optional)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "SKP",
      "name": "Seminar Kerja Praktik",
      "description": "Seminar untuk Kerja Praktik"
    },
    {
      "id": 2,
      "code": "SEMPRO",
      "name": "Seminar Proposal",
      "description": "Seminar Proposal Tugas Akhir"
    },
    {
      "id": 3,
      "code": "SIDANG",
      "name": "Sidang Tugas Akhir",
      "description": "Sidang Tugas Akhir"
    }
  ]
}
```

---

## Statistics & Reports

### 16. Get Schedule Statistics
```
GET /schedules/stats
Authorization: Bearer {token}

Query Parameters:
- tanggal_from: YYYY-MM-DD (optional)
- tanggal_to: YYYY-MM-DD (optional)

Response (200):
{
  "success": true,
  "data": {
    "total_schedules": 125,
    "by_type": {
      "SKP": 50,
      "SEMPRO": 40,
      "SIDANG": 35
    },
    "by_status": {
      "DIJADWALKAN": 40,
      "BERLANGSUNG": 5,
      "SELESAI": 75,
      "DITUNDA": 3,
      "BATAL": 2
    }
  }
}
```

### 17. Get Dosen Schedule
```
GET /dosen/:id/schedules
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tanggal": "2024-03-15",
      "judul": "Sistem Monitoring IoT",
      "mahasiswa": "Andi Wijaya",
      "jenis": "SKP",
      "status": "DIJADWALKAN"
    }
  ],
  "summary": {
    "total": 15,
    "pending": 8,
    "completed": 7
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validasi data gagal",
  "errors": [
    {
      "field": "email",
      "message": "Email tidak valid"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token tidak valid atau kadaluarsa"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Anda tidak memiliki akses ke resource ini"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource tidak ditemukan"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Data sudah ada atau terjadi konflik"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Terjadi kesalahan di server"
}
```

---

## Rate Limiting

- Rate limit: 100 requests per minute per IP
- Header response: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Authentication Headers

Semua endpoint (kecuali login dan GET schedules publik) memerlukan header:
```
Authorization: Bearer {jwt_token}
```

Token di-generate saat login dan berlaku selama 24 jam (configurable).
