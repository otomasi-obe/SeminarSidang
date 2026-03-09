import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSchedule, updateSchedule } from '../api/schedules'
import { useAuth } from '../context/AuthContext'
import ScheduleForm from '../components/schedule/ScheduleForm'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { ArrowLeft } from 'lucide-react'

export default function EditSchedulePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isAdmin = ['IT_ADMIN', 'ADMIN'].includes(user?.role)

  const load = useCallback(async () => {
    try {
      const res = await getSchedule(id)
      setSchedule(res.data.schedule || res.data)
    } catch {
      setError('Gagal memuat jadwal')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (formData) => {
    setSaving(true)
    setError('')
    try {
      await updateSchedule(id, formData)
      navigate(`/schedules/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan perubahan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Edit Jadwal</h1>
      </div>
      <ErrorMessage message={error} onDismiss={() => setError('')} />
      <div className="card">
        {schedule && (
          <ScheduleForm
            initialData={schedule}
            onSubmit={handleSubmit}
            loading={saving}
            allowedTypes={isAdmin ? ['SKP', 'SEMPRO', 'SIDANG'] : ['SKP']}
          />
        )}
      </div>
    </div>
  )
}
