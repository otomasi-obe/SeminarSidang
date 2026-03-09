import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSchedules, deleteSchedule } from '../api/schedules'
import Badge from '../components/common/Badge'
import ScheduleFilters from '../components/schedule/ScheduleFilters'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { Calendar, Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export default function SchedulesPage() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [filters, setFilters] = useState({ type: '', status: '', dateFrom: '', dateTo: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = ['IT_ADMIN', 'ADMIN'].includes(user?.role)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.type) params.type = filters.type
      if (filters.status) params.status = filters.status
      if (filters.dateFrom) params.dateFrom = filters.dateFrom
      if (filters.dateTo) params.dateTo = filters.dateTo
      const res = await getSchedules(params)
      setSchedules(res.data.schedules || res.data || [])
    } catch {
      setError('Gagal memuat jadwal')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteSchedule(deleteId)
      setDeleteId(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus jadwal')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  const fmt = (d) => {
    if (!d) return '-'
    try { return format(parseISO(d), 'd MMM yyyy', { locale: id }) } catch { return d }
  }

  const canCreate = ['IT_ADMIN', 'ADMIN', 'DOSEN'].includes(user?.role)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Daftar Jadwal</h1>
        {canCreate && (
          <Link to="/schedules/create" className="btn-primary">
            <Plus className="h-4 w-4" />
            Buat Jadwal
          </Link>
        )}
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <div className="card p-4">
        <ScheduleFilters filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : schedules.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Belum ada jadwal</p>
          {canCreate && (
            <Link to="/schedules/create" className="btn-primary inline-flex">
              <Plus className="h-4 w-4" />
              Buat Jadwal Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Tipe</th>
                  <th className="table-th">Judul</th>
                  <th className="table-th">Mahasiswa</th>
                  <th className="table-th">Tanggal</th>
                  <th className="table-th">Ruangan</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <Badge value={s.type} />
                    </td>
                    <td className="table-td max-w-xs">
                      <p className="truncate font-medium text-gray-900">{s.title || s.judul || '-'}</p>
                    </td>
                    <td className="table-td">{s.mahasiswa?.name || s.mahasiswaName || '-'}</td>
                    <td className="table-td whitespace-nowrap">{fmt(s.tanggal || s.date)}</td>
                    <td className="table-td">{s.ruangan || s.room || '-'}</td>
                    <td className="table-td">
                      <Badge value={s.status} />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/schedules/${s.id}`}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              to={`/schedules/${s.id}/edit`}
                              className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteId(s.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            {schedules.length} jadwal ditemukan
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Jadwal"
        message="Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        loading={deleting}
      />
    </div>
  )
}
