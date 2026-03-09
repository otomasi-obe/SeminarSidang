import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Konfirmasi', confirmVariant = 'danger', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-3 bg-red-100 rounded-full">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
