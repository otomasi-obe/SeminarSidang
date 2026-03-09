import { Check, Circle } from 'lucide-react'

const WORKFLOW_STEPS = [
  { key: 'SUBMITTED_TO_PRODI', label: 'Diajukan ke Prodi' },
  { key: 'EXAMINERS_ASSIGNED', label: 'Penguji Ditentukan' },
  { key: 'SCHEDULED', label: 'Dijadwalkan' },
  { key: 'INVITATION_SENT', label: 'Undangan Terkirim' },
  { key: 'START_EXAM', label: 'Ujian Dimulai' },
  { key: 'COMPLETED', label: 'Selesai' },
]

const STATUS_ORDER = {
  SUBMITTED_TO_PRODI: 0,
  EXAMINERS_ASSIGNED: 1,
  SCHEDULED: 2,
  INVITATION_SENT: 3,
  START_EXAM: 4,
  COMPLETED: 5,
  DITUNDA: -1,
  BATAL: -1,
}

export default function WorkflowSteps({ status }) {
  const currentIdx = STATUS_ORDER[status] ?? -1

  if (status === 'SKP' || status === 'DITUNDA' || status === 'BATAL') {
    return (
      <div className="text-sm text-gray-500 italic">
        Alur kerja tidak tersedia untuk status ini.
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center">
        {WORKFLOW_STEPS.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx
          const future = idx > currentIdx

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : active
                      ? 'bg-white border-indigo-600 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs text-center max-w-[80px] leading-tight ${
                    active ? 'text-indigo-600 font-semibold' : done ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mb-6 mx-1 ${idx < currentIdx ? 'bg-indigo-600' : 'bg-gray-200'}`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
