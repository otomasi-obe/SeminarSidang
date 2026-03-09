import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardStats, getSchedulesToday, getUpcomingSchedules } from '../api/dashboard'
import StatsCard from '../components/dashboard/StatsCard'
import UpcomingSchedules from '../components/dashboard/UpcomingSchedules'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import InvitationPanel from '../components/schedule/InvitationPanel'
import {
  Calendar, Users, CheckCircle, Clock, BookOpen, PlusCircle, AlertCircle
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [today, setToday] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [sRes, tRes, uRes] = await Promise.all([
          getDashboardStats(),
          getSchedulesToday(),
          getUpcomingSchedules(),
        ])
        setStats(sRes.data.stats || sRes.data || {})
        setToday(tRes.data.schedules || tRes.data || [])
        setUpcoming(uRes.data.schedules || uRes.data || [])
      } catch {
        setError('Gagal memuat data dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  const isAdmin = ['IT_ADMIN', 'ADMIN'].includes(user?.role)
  const isDosen = user?.role === 'DOSEN'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Selamat Datang, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {(isAdmin || isDosen) && (
          <Link to="/schedules/create" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Buat Jadwal
          </Link>
        )}
      </div>

      <ErrorMessage message={error} />

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isAdmin && (
            <>
              <StatsCard
                title="Total Jadwal"
                value={stats.totalSchedules ?? stats.total}
                icon={Calendar}
                color="indigo"
              />
              <StatsCard
                title="Jadwal Hari Ini"
                value={stats.todayCount ?? today.length}
                icon={Clock}
                color="blue"
              />
              <StatsCard
                title="Selesai"
                value={stats.completedCount ?? stats.completed}
                icon={CheckCircle}
                color="green"
              />
              <StatsCard
                title="Pending Workflow"
                value={stats.pendingCount ?? stats.pending}
                icon={AlertCircle}
                color="yellow"
              />
            </>
          )}
          {isDosen && (
            <>
              <StatsCard
                title="Jadwal Saya"
                value={stats.mySchedules ?? stats.totalSchedules}
                icon={Calendar}
                color="indigo"
              />
              <StatsCard
                title="Sebagai Penguji"
                value={stats.asExaminer ?? 0}
                icon={Users}
                color="purple"
              />
              <StatsCard
                title="Selesai"
                value={stats.completed ?? 0}
                icon={CheckCircle}
                color="green"
              />
              <StatsCard
                title="Mendatang"
                value={upcoming.length}
                icon={Clock}
                color="blue"
              />
            </>
          )}
          {user?.role === 'MAHASISWA' && (
            <>
              <StatsCard
                title="Jadwal Saya"
                value={stats.mySchedules ?? stats.totalSchedules ?? 0}
                icon={BookOpen}
                color="indigo"
              />
              <StatsCard
                title="Status Terkini"
                value={stats.latestStatus ?? '-'}
                icon={AlertCircle}
                color="yellow"
              />
            </>
          )}
        </div>
      )}

      {/* Breakdown by type (Admin) */}
      {isAdmin && stats && (
        <div className="grid grid-cols-3 gap-4">
          <StatsCard title="SKP" value={stats.skpCount ?? stats.byType?.SKP ?? 0} icon={BookOpen} color="indigo" />
          <StatsCard title="SEMPRO" value={stats.semproCount ?? stats.byType?.SEMPRO ?? 0} icon={BookOpen} color="purple" />
          <StatsCard title="Sidang" value={stats.sidangCount ?? stats.byType?.SIDANG ?? 0} icon={BookOpen} color="blue" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UpcomingSchedules schedules={today} title="Jadwal Hari Ini" />
          <UpcomingSchedules schedules={upcoming} title="Jadwal 7 Hari Kedepan" />
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          {(isAdmin || isDosen) && (
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
              <div className="space-y-2">
                <Link to="/schedules/create" className="btn-primary w-full justify-center">
                  <PlusCircle className="h-4 w-4" />
                  Buat Jadwal Baru
                </Link>
                <Link to="/schedules" className="btn-secondary w-full justify-center">
                  <Calendar className="h-4 w-4" />
                  Lihat Semua Jadwal
                </Link>
                {user?.role === 'IT_ADMIN' && (
                  <Link to="/users" className="btn-secondary w-full justify-center">
                    <Users className="h-4 w-4" />
                    Manajemen User
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Invitations */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Undangan Terbaru</h2>
            <InvitationPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
