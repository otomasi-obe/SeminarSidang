import { useState, useEffect } from 'react'
import PublicLayout from '../layouts/PublicLayout'
import { getSchedules } from '../api/schedules'
import ScheduleCard from '../components/schedule/ScheduleCard'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { Calendar, Search } from 'lucide-react'

const TYPE_TABS = [
  { value: '', label: 'Semua' },
  { value: 'SKP', label: 'SKP' },
  { value: 'SEMPRO', label: 'Seminar Proposal' },
  { value: 'SIDANG', label: 'Sidang' },
]

export default function LandingPage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeType, setActiveType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = {}
        if (activeType) params.type = activeType
        if (dateFrom) params.dateFrom = dateFrom
        if (dateTo) params.dateTo = dateTo
        const res = await getSchedules(params)
        setSchedules(res.data.schedules || res.data || [])
      } catch {
        setError('Gagal memuat jadwal. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeType, dateFrom, dateTo])

  const filtered = schedules.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (s.title || s.judul || '').toLowerCase().includes(q) ||
      (s.mahasiswa?.name || s.mahasiswaName || '').toLowerCase().includes(q)
    )
  })

  return (
    <PublicLayout>
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Calendar className="h-4 w-4" />
          Jadwal Akademik
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Jadwal Seminar &amp; Sidang</h1>
        <p className="text-gray-500">Lihat jadwal seminar proposal dan sidang mahasiswa</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Cari berdasarkan judul atau nama mahasiswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveType(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeType === tab.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Dari:</span>
            <input type="date" className="input-field w-auto" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Sampai:</span>
            <input type="date" className="input-field w-auto" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          {(dateFrom || dateTo) && (
            <button className="btn-secondary text-xs" onClick={() => { setDateFrom(''); setDateTo('') }}>
              Reset Tanggal
            </button>
          )}
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Tidak ada jadwal ditemukan</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} jadwal ditemukan</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <ScheduleCard key={s.id} schedule={s} showActions={false} />
            ))}
          </div>
        </>
      )}
    </PublicLayout>
  )
}
