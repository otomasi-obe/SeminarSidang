import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react'
import Badge from '../common/Badge'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export default function ScheduleCard({ schedule, showActions, onView }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      return format(parseISO(dateStr), 'd MMM yyyy', { locale: id })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <Badge value={schedule.type} className="mb-1" />
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 max-w-xs">
              {schedule.title || schedule.judul || '-'}
            </h3>
          </div>
        </div>
        <Badge value={schedule.status} />
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>{schedule.mahasiswa?.name || schedule.mahasiswaName || '-'}</span>
        </div>
        {schedule.pembimbing && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500">Pembimbing: {schedule.pembimbing?.name || '-'}</span>
          </div>
        )}
        {(schedule.tanggal || schedule.date) && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{formatDate(schedule.tanggal || schedule.date)}</span>
          </div>
        )}
        {(schedule.jam_mulai || schedule.startTime) && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{schedule.jam_mulai || schedule.startTime} – {schedule.jam_selesai || schedule.endTime}</span>
          </div>
        )}
        {(schedule.ruangan || schedule.room) && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{schedule.ruangan || schedule.room}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            to={`/schedules/${schedule.id}`}
            className="btn-secondary w-full justify-center text-xs"
          >
            Lihat Detail
          </Link>
        </div>
      )}
    </div>
  )
}
