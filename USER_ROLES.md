# User Roles & Permissions

## Overview

Sistem menggunakan Role-Based Access Control (RBAC) dengan 5 role utama:
1. **IT Admin** - Administrator teknis dengan akses penuh
2. **Admin** - Administrator akademik yang manajal jadwal
3. **Prodi** - Koordinator Program Studi yang manage seminar proposal
4. **Dosen** - Pengajar yang membuat dan mengelola jadwal mereka
5. **Mahasiswa** - Pelajar yang melihat jadwal mereka

---

## Role Definitions & Permissions

### 1. IT_ADMIN (IT Administrator)

**Deskripsi**: Administrator sistem dengan akses penuh ke semua fitur.

**Permissions:**
| Fitur | Create | Read | Update | Delete |
|-------|--------|------|--------|--------|
| Users | ✅ | ✅ | ✅ | ✅ |
| Schedules | ✅ | ✅ | ✅ | ✅ |
| Schedule Types | ✅ | ✅ | ✅ | ✅ |
| Reports | ❌ | ✅ | ❌ | ❌ |
| System Settings | ✅ | ✅ | ✅ | ❌ |

**Akses:**
- Bisa membuat, edit, hapus user apapun
- Bisa membuat, edit, hapus jadwal apapun
- Bisa melihat laporan sistem lengkap
- Bisa monitor aktivitas user
- Bisa mengatur backup database
- Bisa reset password user

**Limitations:** Tidak ada

**Use Cases:**
- Onboarding user baru
- Manage sistem database
- Troubleshoot technical issues
- System monitoring

---

### 2. ADMIN (Administrator Akademik)

**Deskripsi**: Administrator akademik yang mengelola jadwal seminar dan sidang.

**Permissions:**
| Fitur | Create | Read | Update | Delete |
|-------|--------|------|--------|--------|
| Users | ❌ | ✅* | ❌ | ❌ |
| Schedules | ✅ | ✅ | ✅ | ✅ |
| Schedule Types | ❌ | ✅ | ❌ | ❌ |
| Reports | ❌ | ✅ | ❌ | ❌ |
| System Settings | ❌ | ❌ | ❌ | ❌ |

*Hanya bisa melihat profil user, tidak bisa mengedit

**Akses:**
- Bisa membuat jadwal untuk semua mahasiswa
- Bisa edit/hapus jadwal apapun
- Bisa ubah status jadwal (DIJADWALKAN, BERLANGSUNG, SELESAI, dll)
- Bisa melihat laporan jadwal
- Bisa preview landing page

**Limitations:**
- Tidak bisa membuat/edit user
- Tidak bisa akses system settings
- Tidak bisa mengelola role/permissions

**Use Cases:**
- Menambah jadwal baru ke sistem
- Mengubah waktu jadwal jika ada perubahan
- Membatalkan jadwal
- Generate laporan jadwal

---

### 3. DOSEN (Dosen Pembimbing)

**Deskripsi**: Dosen yang membuat dan mengelola jadwal seminar untuk mahasiswa mereka.

**Permissions:**
| Fitur | Create | Read | Update | Delete |
|-------|--------|------|--------|--------|
| Own Schedules | ✅ | ✅ | ✅ | ❌ |
| All Schedules | ❌ | ✅ | ❌ | ❌ |
| Users | ❌ | ✅* | ❌ | ❌ |

*Hanya bisa melihat profil mahasiswa dan dosen lain

**Akses:**
- Bisa membuat jadwal untuk mahasiswa yang menjadi bimbingan mereka
- Bisa edit jadwal yang mereka buat
- Bisa melihat jadwal dosen lain (read-only)
- Bisa melihat jadwal semua mahasiswa (read-only)
- Bisa melihat profil mahasiswa

**Limitations:**
- Tidak bisa delete jadwal (hanya ADMIN/IT_ADMIN)
- Tidak bisa edit jadwal yang dibuat dosen lain / ADMIN
- Tidak bisa create user
- Tidak bisa ubah role/permissions

**Use Cases:**
- Jadwalkan seminar untuk mahasiswa bimbingan
- Update jadwal jika ada perubahan waktu
- Lihat semua jadwal yang ada di sistem
- Monitor jadwal semua mahasiswa pembimbingan

---

### 4. MAHASISWA (Mahasiswa)

**Deskripsi**: Mahasiswa yang hanya bisa melihat jadwal mereka dan jadwal publik.

**Permissions:**
| Fitur | Create | Read | Update | Delete |
|-------|--------|------|--------|--------|
| Own Schedules | ❌ | ✅ | ❌ | ❌ |
| All Schedules | ❌ | ✅ | ❌ | ❌ |
| Users | ❌ | ✅* | ❌ | ❌ |

*Hanya bisa melihat profil dosen pembimbing dan mahasiswa lain yang dijadwalkan

**Akses:**
- Read-only ke semua jadwal
- Bisa melihat jadwal pribadi mereka (lengkap dengan detail)
- Bisa melihat jadwal mahasiswa lain (hanya yang publik/sudah dijadwalkan)
- Bisa filter jadwal berdasarkan type, dosen, atau tanggal

**Limitations:**
- Tidak bisa create/edit/delete jadwal
- Tidak bisa akses management features
- Tidak bisa lihat data user lain (privacy)

**Use Cases:**
- Melihat jadwal seminar mereka
- Melihat jadwal dosen pembimbing
- Melihat jadwal mahasiswa lain untuk referensi
- Check kehadiran/history

---

### 5. GUEST (Tanpa Login)

**Deskripsi**: User yang belum login, hanya bisa akses landing page publik.

**Permissions:**
| Fitur | Access |
|-------|--------|
| Landing Page | ✅ |
| Schedule Detail | ✅ |
| Other Features | ❌ |

**Akses:**
- Bisa melihat landing page dengan jadwal terjadwal
- Bisa melihat detail jadwal individual
- Bisa search/filter jadwal
- Bisa export jadwal (optional)

**Limitations:**
- Hanya read-only landing page
- Tidak bisa akses fitur management
- Harus login untuk fitur tambahan

---

## API Endpoint Permission Matrix

| Endpoint | IT_ADMIN | ADMIN | DOSEN | MAHASISWA | GUEST |
|----------|----------|-------|-------|-----------|-------|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /schedules | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /schedules | ✅ | ✅ | ✅* | ❌ | ❌ |
| PUT /schedules/:id | ✅ | ✅ | ✅** | ❌ | ❌ |
| DELETE /schedules/:id | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /users | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /users | ✅ | ❌ | ❌ | ❌ | ❌ |
| PUT /users/:id | ✅ | ❌ | ✅*** | ❌ | ❌ |
| DELETE /users/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /schedules/stats | ✅ | ✅ | ✅ | ❌ | ❌ |

*DOSEN hanya bisa create jadwal untuk mahasiswa bimbingan mereka
**DOSEN hanya bisa edit jadwal yang mereka buat
***DOSEN hanya bisa edit profil diri sendiri

---

## Default Permissions by Feature

### Schedule Management
- **Create**: IT_ADMIN, ADMIN, DOSEN (terbatas)
- **Read**: IT_ADMIN, ADMIN, DOSEN, MAHASISWA, GUEST
- **Update**: IT_ADMIN, ADMIN, DOSEN (terbatas)
- **Delete**: IT_ADMIN, ADMIN only

### User Management
- **Create**: IT_ADMIN only
- **Read**: IT_ADMIN only (all users), others (limited profile)
- **Update**: IT_ADMIN (all), Self (profile only)
- **Delete**: IT_ADMIN only

### Reports
- **Generate**: IT_ADMIN, ADMIN, DOSEN
- **View**: IT_ADMIN, ADMIN, DOSEN

---

## Implementation Guidelines

### 1. Frontend Authorization
```javascript
// Check role sebelum render component
if (!hasPermission(user.role, 'CREATE_SCHEDULE')) {
  return <Unauthorized />;
}
```

### 2. Backend Authorization (Middleware)
```python
@require_roles(['IT_ADMIN', 'ADMIN'])
def create_schedule(request):
    # Only IT_ADMIN and ADMIN can create
    pass

@require_roles(['IT_ADMIN', 'ADMIN', 'DOSEN'])  
def update_schedule(request, schedule_id):
    # Dosen hanya bisa update jadwal mereka sendiri
    schedule = Schedule.get(id=schedule_id)
    if request.user.role == 'DOSEN' and schedule.dosen_id != request.user.id:
        raise Forbidden()
```

### 3. Data Filtering by Role
```python
def get_schedules(user):
    if user.role == 'IT_ADMIN' or user.role == 'ADMIN':
        return Schedule.all()  # Get all
    elif user.role == 'DOSEN':
        # Get jadwal yang mereka buat + jadwal mahasiswa bimbingan mereka
        return Schedule.filter(dosen_id=user.id)
    elif user.role == 'MAHASISWA':
        # Get jadwal mereka + jadwal yang sudah public
        return Schedule.filter(
            models.or_(
                Schedule.mahasiswa_id == user.id,
                Schedule.status == 'DIJADWALKAN'
            )
        )
```

---

## Future Role Considerations

Kemungkinan role tambahan di masa depan:
- **KOORDINATOR_PRODI**: Koordinator program studi
- **SUPER_ADMIN**: Admin dengan limited IT access
- **OBSERVER**: Role read-only untuk keperluan observasi

---

## Security Notes

1. **Password Security**: Semua password di-hash dengan bcrypt
2. **Token Expiry**: JWT token berlaku 24 jam
3. **Audit Trail**: Setiap action tracked dengan user ID dan timestamp
4. **Rate Limiting**: 100 requests/minute per user
5. **CORS Protection**: API hanya bisa diakses dari frontend tertentu
