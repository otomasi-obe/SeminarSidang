import { useState, useEffect } from 'react'
import { getUsersByRole } from '../../api/users'
import { addExaminer } from '../../api/examiners'
import ErrorMessage from '../common/ErrorMessage'

export default function ExaminerForm({ scheduleId, onSuccess }) {
  const [dosenList, setDosenList] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [role, setRole] = useState('PENGUJI')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getUsersByRole('dosen')
      .then((res) => setDosenList(res.data.users || res.data || []))
      .catch(() => setError('Gagal memuat daftar dosen'))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedId) return setError('Pilih dosen terlebih dahulu')
    setLoading(true)
    setError('')
    try {
      await addExaminer(scheduleId, { userId: selectedId, role })
      setSelectedId('')
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah penguji')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <ErrorMessage message={error} onDismiss={() => setError('')} />
      <div className="flex gap-3">
        <select
          className="input-field flex-1"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">-- Pilih Dosen --</option>
          {dosenList.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          className="input-field w-40"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="PENGUJI">Penguji</option>
          <option value="KETUA">Ketua</option>
          <option value="SEKRETARIS">Sekretaris</option>
        </select>
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={loading}>
          {loading ? '...' : 'Tambah'}
        </button>
      </div>
    </form>
  )
}
