import { useState, useEffect, useCallback } from 'react'
import { getUsers, createUser, updateUser } from '../api/users'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { Plus, Pencil, UserCheck, UserX, Search } from 'lucide-react'

const ROLES = ['IT_ADMIN', 'ADMIN', 'DOSEN', 'MAHASISWA']
const ROLE_TABS = [{ value: '', label: 'Semua' }, ...ROLES.map((r) => ({ value: r, label: r }))]

const EMPTY_FORM = { name: '', email: '', password: '', role: 'DOSEN', nip: '', nim: '', is_active: true }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (roleFilter) params.role = roleFilter
      const res = await getUsers(params)
      setUsers(res.data.users || res.data || [])
    } catch {
      setError('Gagal memuat data pengguna')
    } finally {
      setLoading(false)
    }
  }, [roleFilter])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditUser(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (u) => {
    setEditUser(u)
    setForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'DOSEN',
      nip: u.nip || '',
      nim: u.nim || '',
      is_active: u.is_active ?? true,
    })
    setFormError('')
    setShowModal(true)
  }

  const handleToggleActive = async (u) => {
    try {
      await updateUser(u.id, { is_active: !u.is_active })
      load()
    } catch {
      setError('Gagal mengubah status pengguna')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (editUser) {
        await updateUser(editUser.id, payload)
      } else {
        await createUser(payload)
      }
      setShowModal(false)
      load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan pengguna')
    } finally {
      setSaving(false)
    }
  }

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }))

  const filtered = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" />
          Tambah Pengguna
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                roleFilter === tab.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Nama</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">NIP/NIM</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td font-medium text-gray-900">{u.name}</td>
                    <td className="table-td text-gray-500">{u.email}</td>
                    <td className="table-td"><Badge value={u.role} /></td>
                    <td className="table-td text-gray-500">{u.nip || u.nim || '-'}</td>
                    <td className="table-td">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                          title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {u.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            {filtered.length} pengguna ditemukan
          </div>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ErrorMessage message={formError} onDismiss={() => setFormError('')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
            <input type="text" className="input-field" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {editUser ? '(kosongkan jika tidak diubah)' : '*'}
            </label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required={!editUser}
              placeholder={editUser ? '••••••••' : ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select className="input-field" value={form.role} onChange={(e) => set('role', e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {(form.role === 'DOSEN' || form.role === 'ADMIN' || form.role === 'IT_ADMIN') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
              <input type="text" className="input-field" value={form.nip} onChange={(e) => set('nip', e.target.value)} />
            </div>
          )}
          {form.role === 'MAHASISWA' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
              <input type="text" className="input-field" value={form.nim} onChange={(e) => set('nim', e.target.value)} />
            </div>
          )}
          {editUser && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => set('is_active', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">Pengguna Aktif</label>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
