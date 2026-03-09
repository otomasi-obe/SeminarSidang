import { useState, useEffect } from 'react'
import { getUsersByRole } from '../../api/users'
import ErrorMessage from '../common/ErrorMessage'

const TYPES = ['SKP', 'SEMPRO', 'SIDANG']

export default function ScheduleForm({ initialData = {}, onSubmit, loading, allowedTypes }) {
  const [form, setForm] = useState({
    type: initialData.type || (allowedTypes ? allowedTypes[0] : 'SKP'),
    mahasiswaId: initialData.mahasiswaId || initialData.mahasiswa_id || '',
    title: initialData.title || initialData.judul || '',
    pembimbingId: initialData.pembimbingId || initialData.pembimbing_id || '',
    tanggal: initialData.tanggal || initialData.date || '',
    jam_mulai: initialData.jam_mulai || initialData.startTime || '',
    jam_selesai: initialData.jam_selesai || initialData.endTime || '',
    ruangan: initialData.ruangan || initialData.room || '',
    lokasi: initialData.lokasi || initialData.location || '',
    catatan: initialData.catatan || initialData.notes || '',
  })
  const [mahasiswaList, setMahasiswaList] = useState([])
  const [dosenList, setDosenList] = useState([])
  const [error, setError] = useState('')

  const types = allowedTypes || TYPES

  useEffect(() => {
    Promise.all([getUsersByRole('mahasiswa'), getUsersByRole('dosen')])
      .then(([mRes, dRes]) => {
        setMahasiswaList(mRes.data.users || mRes.data || [])
        setDosenList(dRes.data.users || dRes.data || [])
      })
      .catch(() => setError('Gagal memuat data pengguna'))
  }, [])

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.mahasiswaId) return setError('Mahasiswa wajib dipilih')
    if (!form.title) return setError('Judul wajib diisi')
    setError('')
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Jadwal *</label>
        <select className="input-field" value={form.type} onChange={(e) => set('type', e.target.value)}>
          {types.map((t) => (
            <option key={t} value={t}>{t === 'SEMPRO' ? 'Seminar Proposal' : t === 'SIDANG' ? 'Sidang' : 'SKP'}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mahasiswa *</label>
        <select className="input-field" value={form.mahasiswaId} onChange={(e) => set('mahasiswaId', e.target.value)} required>
          <option value="">-- Pilih Mahasiswa --</option>
          {mahasiswaList.map((m) => (
            <option key={m.id} value={m.id}>{m.name} ({m.nim || m.nip || m.email})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
        <input
          type="text"
          className="input-field"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Judul penelitian / tugas akhir"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dosen Pembimbing</label>
        <select className="input-field" value={form.pembimbingId} onChange={(e) => set('pembimbingId', e.target.value)}>
          <option value="">-- Pilih Dosen Pembimbing --</option>
          {dosenList.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input type="date" className="input-field" value={form.tanggal} onChange={(e) => set('tanggal', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
          <input type="time" className="input-field" value={form.jam_mulai} onChange={(e) => set('jam_mulai', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
          <input type="time" className="input-field" value={form.jam_selesai} onChange={(e) => set('jam_selesai', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan</label>
          <input type="text" className="input-field" value={form.ruangan} onChange={(e) => set('ruangan', e.target.value)} placeholder="Contoh: Ruang A101" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
          <input type="text" className="input-field" value={form.lokasi} onChange={(e) => set('lokasi', e.target.value)} placeholder="Gedung / Kampus" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
        <textarea
          className="input-field resize-none"
          rows={3}
          value={form.catatan}
          onChange={(e) => set('catatan', e.target.value)}
          placeholder="Catatan tambahan..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
        </button>
      </div>
    </form>
  )
}
