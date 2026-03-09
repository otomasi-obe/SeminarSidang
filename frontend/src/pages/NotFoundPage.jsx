import { Link } from 'react-router-dom'
import { GraduationCap, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full mb-6">
          <GraduationCap className="h-10 w-10 text-indigo-400" />
        </div>
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-secondary justify-center">
            <ArrowLeft className="h-4 w-4" />
            Ke Beranda
          </Link>
          <Link to="/dashboard" className="btn-primary justify-center">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
