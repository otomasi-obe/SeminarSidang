import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createSchedule } from '../api/schedules'
import ScheduleForm from '../components/schedule/ScheduleForm'
import ErrorMessage from '../components/common/ErrorMessage'
import { ArrowLeft } from 'lucide-react'

export default function CreateSchedulePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isDosen = user?.role === 'DOSEN'
  const allowedTypes = isDosen ? ['SKP'] : ['SKP', 'SEMPRO', 'SIDANG']

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError('')
    try {
      const res = await createSchedule(formData)
      const id = res.data.schedule?.id || res.data?.id
      navigate(id ? `/schedules/${id}` : '/schedules')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat jadwal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Buat Jadwal Baru</h1>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <div className="card">
        <ScheduleForm onSubmit={handleSubmit} loading={loading} allowedTypes={allowedTypes} />
      </div>
    </div>
  )
}
