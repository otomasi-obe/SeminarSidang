import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm sm:text-base">
              Sistem Jadwal Seminar &amp; Sidang
            </span>
          </div>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
