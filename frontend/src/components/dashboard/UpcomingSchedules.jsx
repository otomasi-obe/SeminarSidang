import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin } from 'lucide-react'
import Badge from '../common/Badge'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export default function UpcomingSchedules({ schedules = [], title = 'Jadwal Mendatang' }) {
  const fmt = (d) => {
    if (!d) return '-'
    try { return format(parseISO(d), 'd MMM yyyy', { locale: id }) } catch { return d }
  }

  if (!schedules.length) {
    return (
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
        <p className="text-sm text-gray-400 text-center py-6">Tidak ada jadwal</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {schedules.map((s) => (
          <Link
            key={s.id}
            to={`/schedules/${s.id}`}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge value={s.type} />
                <Badge value={s.status} />
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">{s.title || s.judul}</p>
              <p className="text-xs text-gray-500">{s.mahasiswa?.name || s.mahasiswaName}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                {(s.tanggal || s.date) && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {fmt(s.tanggal || s.date)}
                  </span>
                )}
                {(s.jam_mulai || s.startTime) && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {s.jam_mulai || s.startTime}
                  </span>
                )}
                {(s.ruangan || s.room) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {s.ruangan || s.room}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
