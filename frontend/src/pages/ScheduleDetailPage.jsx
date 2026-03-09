import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getSchedule, sendInvitations, startExam, completeExam, setSchedule as apiSetSchedule
} from '../api/schedules'
import { getExaminers, removeExaminer, updateScore } from '../api/examiners'
import WorkflowSteps from '../components/schedule/WorkflowSteps'
import ExaminerForm from '../components/schedule/ExaminerForm'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import {
  ArrowLeft, Calendar, Clock, MapPin, User, BookOpen,
  Send, Play, CheckCircle, Trash2, Star, AlertCircle, Pencil
} from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { id } from 'date-fns/locale'

export default function ScheduleDetailPage() {
  const { id: scheduleId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [schedule, setSchedule] = useState(null)
  const [examiners, setExaminers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [showScoreModal, setShowScoreModal] = useState(null)
  const [showSetScheduleModal, setShowSetScheduleModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [scoreForm, setScoreForm] = useState({ score: '', notes: '' })
  const [setScheduleForm, setSetScheduleForm] = useState({ tanggal: '', jam_mulai: '', jam_selesai: '', ruangan: '', lokasi: '' })

  const isAdmin = ['IT_ADMIN', 'ADMIN'].includes(user?.role)
  const isDosen = user?.role === 'DOSEN'

  const load = useCallback(async () => {
    try {
      const [sRes, eRes] = await Promise.all([getSchedule(scheduleId), getExaminers(scheduleId)])
      setSchedule(sRes.data.schedule || sRes.data)
      setExaminers(eRes.data.examiners || eRes.data || [])
    } catch {
      setError('Gagal memuat detail jadwal')
    } finally {
      setLoading(false)
    }
  }, [scheduleId])

  useEffect(() => { load() }, [load])

  const fmt = (d) => {
    if (!d) return '-'
    try { return format(parseISO(d), 'd MMMM yyyy', { locale: id }) } catch { return d }
  }

  const daysUntil = schedule?.tanggal || schedule?.date
    ? differenceInDays(parseISO(schedule.tanggal || schedule.date), new Date())
    : null

  const handleAction = async (action) => {
    setActionLoading(action)
    setError('')
    try {
      if (action === 'send-invitations') await sendInvitations(scheduleId)
      else if (action === 'start-exam') await startExam(scheduleId)
      else if (action === 'complete') await completeExam(scheduleId)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || `Gagal melakukan aksi: ${action}`)
    } finally {
      setActionLoading('')
      setConfirmAction(null)
    }
  }

  const handleSetSchedule = async (e) => {
    e.preventDefault()
    setActionLoading('set-schedule')
    try {
      await apiSetSchedule(scheduleId, setScheduleForm)
      setShowSetScheduleModal(false)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengatur jadwal')
    } finally {
      setActionLoading('')
    }
  }

  const handleRemoveExaminer = async (examinerId) => {
    try {
      await removeExaminer(scheduleId, examinerId)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus penguji')
    }
  }

  const handleScore = async (e) => {
    e.preventDefault()
    setActionLoading('score')
    try {
      await updateScore(scheduleId, showScoreModal.id, scoreForm)
      setShowScoreModal(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan nilai')
    } finally {
      setActionLoading('')
    }
  }

  const isExaminer = examiners.some((e) => e.userId === user?.id || e.user?.id === user?.id)

  if (loading) return <LoadingSpinner />
  if (!schedule) return <ErrorMessage message={error || 'Jadwal tidak ditemukan'} />

  const status = schedule.status

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge value={schedule.type} />
            <Badge value={status} />
          </div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">{schedule.title || schedule.judul}</h1>
        </div>
        {isAdmin && (
          <Link to={`/schedules/${scheduleId}/edit`} className="btn-secondary">
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* H-3 Countdown */}
      {status === 'SCHEDULED' && daysUntil !== null && daysUntil <= 3 && daysUntil >= 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {daysUntil === 0 ? 'Ujian hari ini!' : `H-${daysUntil} batas pengiriman undangan`}
            </p>
            <p className="text-xs text-amber-600">Undangan harus dikirim sebelum hari ujian</p>
          </div>
        </div>
      )}

      {/* Workflow */}
      {(schedule.type === 'SEMPRO' || schedule.type === 'SIDANG') && (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Alur Kerja</h2>
          <WorkflowSteps status={status} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Informasi Jadwal</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mahasiswa</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  {schedule.mahasiswa?.name || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pembimbing</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  {schedule.pembimbing?.name || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tanggal</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {fmt(schedule.tanggal || schedule.date)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Waktu</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {schedule.jam_mulai || schedule.startTime || '-'} – {schedule.jam_selesai || schedule.endTime || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ruangan</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {schedule.ruangan || schedule.room || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lokasi</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {schedule.lokasi || schedule.location || '-'}
                </dd>
              </div>
            </dl>
            {(schedule.catatan || schedule.notes) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Catatan</dt>
                <p className="text-sm text-gray-700">{schedule.catatan || schedule.notes}</p>
              </div>
            )}
          </div>

          {/* Examiners */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Dewan Penguji</h2>
            </div>
            {isAdmin && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <ExaminerForm scheduleId={scheduleId} onSuccess={load} />
              </div>
            )}
            {examiners.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada penguji ditentukan</p>
            ) : (
              <div className="space-y-3">
                {examiners.map((ex) => (
                  <div key={ex.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-sm">
                        {(ex.user?.name || ex.name || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{ex.user?.name || ex.name}</p>
                      <p className="text-xs text-gray-500">{ex.role || 'Penguji'}</p>
                    </div>
                    {ex.score !== null && ex.score !== undefined && (
                      <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold">
                        <Star className="h-4 w-4" />
                        {ex.score}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const canInputScore = isDosen && isExaminer && status === 'START_EXAM';
                        return canInputScore;
                      })() && (
                        <button
                          onClick={() => { setShowScoreModal(ex); setScoreForm({ score: ex.score || '', notes: ex.notes || '' }) }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Input Nilai"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveExaminer(ex.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Penguji"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        {isAdmin && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Aksi Workflow</h2>
              <div className="space-y-2">
                {(status === 'SUBMITTED_TO_PRODI' || status === 'EXAMINERS_ASSIGNED') && (
                  <button
                    onClick={() => setShowSetScheduleModal(true)}
                    className="btn-primary w-full justify-center"
                  >
                    <Calendar className="h-4 w-4" />
                    Atur Jadwal
                  </button>
                )}
                {status === 'SCHEDULED' && (
                  <button
                    onClick={() => setConfirmAction('send-invitations')}
                    disabled={!!actionLoading}
                    className="btn-primary w-full justify-center"
                  >
                    <Send className="h-4 w-4" />
                    Kirim Undangan
                  </button>
                )}
                {status === 'INVITATION_SENT' && (
                  <button
                    onClick={() => setConfirmAction('start-exam')}
                    disabled={!!actionLoading}
                    className="btn-primary w-full justify-center bg-amber-600 hover:bg-amber-700"
                  >
                    <Play className="h-4 w-4" />
                    Mulai Ujian
                  </button>
                )}
                {status === 'START_EXAM' && (
                  <button
                    onClick={() => setConfirmAction('complete')}
                    disabled={!!actionLoading}
                    className="btn-primary w-full justify-center bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Selesaikan Ujian
                  </button>
                )}
              </div>
            </div>

            {/* Invitation status */}
            {schedule.invitationStatus && (
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Status Undangan</h2>
                <Badge value={schedule.invitationStatus} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Set Schedule Modal */}
      <Modal isOpen={showSetScheduleModal} onClose={() => setShowSetScheduleModal(false)} title="Atur Jadwal Ujian">
        <form onSubmit={handleSetSchedule} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input type="date" className="input-field" value={setScheduleForm.tanggal} onChange={(e) => setSetScheduleForm((f) => ({ ...f, tanggal: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
              <input type="time" className="input-field" value={setScheduleForm.jam_mulai} onChange={(e) => setSetScheduleForm((f) => ({ ...f, jam_mulai: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
              <input type="time" className="input-field" value={setScheduleForm.jam_selesai} onChange={(e) => setSetScheduleForm((f) => ({ ...f, jam_selesai: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan</label>
            <input type="text" className="input-field" value={setScheduleForm.ruangan} onChange={(e) => setSetScheduleForm((f) => ({ ...f, ruangan: e.target.value }))} placeholder="Ruang A101" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
            <input type="text" className="input-field" value={setScheduleForm.lokasi} onChange={(e) => setSetScheduleForm((f) => ({ ...f, lokasi: e.target.value }))} placeholder="Gedung / Kampus" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowSetScheduleModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" className="btn-primary" disabled={actionLoading === 'set-schedule'}>
              {actionLoading === 'set-schedule' ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Score Modal */}
      <Modal isOpen={!!showScoreModal} onClose={() => setShowScoreModal(null)} title="Input Nilai Mahasiswa" size="sm">
        <form onSubmit={handleScore} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Penguji</label>
            <p className="text-sm text-gray-900">{showScoreModal?.user?.name || showScoreModal?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nilai (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="input-field"
              value={scoreForm.score}
              onChange={(e) => setScoreForm((f) => ({ ...f, score: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea className="input-field resize-none" rows={3} value={scoreForm.notes} onChange={(e) => setScoreForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowScoreModal(null)} className="btn-secondary">Batal</button>
            <button type="submit" className="btn-primary" disabled={actionLoading === 'score'}>
              {actionLoading === 'score' ? 'Menyimpan...' : 'Simpan Nilai'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleAction(confirmAction)}
        title={
          confirmAction === 'send-invitations' ? 'Kirim Undangan' :
          confirmAction === 'start-exam' ? 'Mulai Ujian' :
          'Selesaikan Ujian'
        }
        message={
          confirmAction === 'send-invitations' ? 'Kirim undangan ke semua penguji?' :
          confirmAction === 'start-exam' ? 'Tandai ujian sebagai berlangsung?' :
          'Tandai ujian sebagai selesai? Pastikan semua nilai sudah diinput.'
        }
        confirmText="Ya, Lanjutkan"
        confirmVariant="primary"
        loading={!!actionLoading}
      />
    </div>
  )
}
