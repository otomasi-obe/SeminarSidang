import { useState, useEffect } from 'react'
import { getInvitations, markInvitationRead } from '../../api/invitations'
import { Mail, MailOpen } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'

export default function InvitationPanel() {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await getInvitations()
      setInvitations(res.data.invitations || res.data || [])
    } catch {
      setError('Gagal memuat undangan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRead = async (invId) => {
    try {
      await markInvitationRead(invId)
      setInvitations((prev) => prev.map((inv) => inv.id === invId ? { ...inv, is_read: true } : inv))
    } catch {
      // ignore
    }
  }

  if (loading) return <LoadingSpinner size="sm" />
  if (error) return <ErrorMessage message={error} />

  if (invitations.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">Tidak ada undangan</p>
  }

  return (
    <div className="space-y-3">
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className={`flex items-start gap-3 p-3 rounded-lg border ${inv.is_read ? 'border-gray-100 bg-white' : 'border-indigo-100 bg-indigo-50'}`}
        >
          <div className={`mt-0.5 ${inv.is_read ? 'text-gray-400' : 'text-indigo-600'}`}>
            {inv.is_read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{inv.schedule?.title || inv.title || 'Undangan Ujian'}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {inv.created_at ? format(parseISO(inv.created_at), 'd MMM yyyy HH:mm', { locale: id }) : ''}
            </p>
          </div>
          {!inv.is_read && (
            <button onClick={() => handleRead(inv.id)} className="text-xs text-indigo-600 hover:underline whitespace-nowrap">
              Tandai Dibaca
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
