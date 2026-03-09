export default function ScheduleFilters({ filters, onChange }) {
  const types = ['', 'SKP', 'SEMPRO', 'SIDANG']
  const statuses = ['', 'SUBMITTED_TO_PRODI', 'EXAMINERS_ASSIGNED', 'SCHEDULED', 'INVITATION_SENT', 'START_EXAM', 'COMPLETED', 'DITUNDA', 'BATAL']

  const typeLabels = { '': 'Semua Tipe', SKP: 'SKP', SEMPRO: 'Seminar Proposal', SIDANG: 'Sidang' }
  const statusLabels = {
    '': 'Semua Status',
    SUBMITTED_TO_PRODI: 'Diajukan ke Prodi',
    EXAMINERS_ASSIGNED: 'Penguji Ditentukan',
    SCHEDULED: 'Dijadwalkan',
    INVITATION_SENT: 'Undangan Terkirim',
    START_EXAM: 'Berlangsung',
    COMPLETED: 'Selesai',
    DITUNDA: 'Ditunda',
    BATAL: 'Batal',
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        className="input-field w-auto"
        value={filters.type || ''}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
      >
        {types.map((t) => <option key={t} value={t}>{typeLabels[t]}</option>)}
      </select>

      <select
        className="input-field w-auto"
        value={filters.status || ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      >
        {statuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
      </select>

      <input
        type="date"
        className="input-field w-auto"
        value={filters.dateFrom || ''}
        onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
        placeholder="Dari tanggal"
      />
      <input
        type="date"
        className="input-field w-auto"
        value={filters.dateTo || ''}
        onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
        placeholder="Sampai tanggal"
      />

      {(filters.type || filters.status || filters.dateFrom || filters.dateTo) && (
        <button
          className="btn-secondary text-xs"
          onClick={() => onChange({ type: '', status: '', dateFrom: '', dateTo: '' })}
        >
          Reset Filter
        </button>
      )}
    </div>
  )
}
