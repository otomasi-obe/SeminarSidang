const STATUS_COLORS = {
  // Schedule statuses
  SUBMITTED_TO_PRODI: 'bg-purple-100 text-purple-700',
  EXAMINERS_ASSIGNED: 'bg-indigo-100 text-indigo-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  DIJADWALKAN: 'bg-blue-100 text-blue-700',
  INVITATION_SENT: 'bg-teal-100 text-teal-700',
  START_EXAM: 'bg-yellow-100 text-yellow-700',
  BERLANGSUNG: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  SELESAI: 'bg-green-100 text-green-700',
  DITUNDA: 'bg-orange-100 text-orange-700',
  BATAL: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-red-100 text-red-700',
  // Roles
  IT_ADMIN: 'bg-red-100 text-red-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  DOSEN: 'bg-blue-100 text-blue-700',
  MAHASISWA: 'bg-green-100 text-green-700',
  // Types
  SKP: 'bg-gray-100 text-gray-700',
  SEMPRO: 'bg-indigo-100 text-indigo-700',
  SIDANG: 'bg-violet-100 text-violet-700',
}

const STATUS_LABELS = {
  SUBMITTED_TO_PRODI: 'Diajukan ke Prodi',
  EXAMINERS_ASSIGNED: 'Penguji Ditentukan',
  SCHEDULED: 'Dijadwalkan',
  DIJADWALKAN: 'Dijadwalkan',
  INVITATION_SENT: 'Undangan Terkirim',
  START_EXAM: 'Sedang Berlangsung',
  BERLANGSUNG: 'Berlangsung',
  COMPLETED: 'Selesai',
  SELESAI: 'Selesai',
  DITUNDA: 'Ditunda',
  BATAL: 'Batal',
  CANCELLED: 'Dibatalkan',
  IT_ADMIN: 'IT Admin',
  ADMIN: 'Admin',
  DOSEN: 'Dosen',
  MAHASISWA: 'Mahasiswa',
  SKP: 'SKP',
  SEMPRO: 'Seminar Proposal',
  SIDANG: 'Sidang',
}

export default function Badge({ value, className = '' }) {
  const colorClass = STATUS_COLORS[value] || 'bg-gray-100 text-gray-700'
  const label = STATUS_LABELS[value] || value

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  )
}
