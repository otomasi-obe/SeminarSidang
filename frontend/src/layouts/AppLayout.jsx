import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, PlusCircle, Users, LogOut,
  GraduationCap, Menu, X, Bell
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/common/Badge'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['IT_ADMIN', 'ADMIN', 'DOSEN', 'MAHASISWA'] },
  { to: '/schedules', icon: Calendar, label: 'Jadwal', roles: ['IT_ADMIN', 'ADMIN', 'DOSEN', 'MAHASISWA'] },
  { to: '/schedules/create', icon: PlusCircle, label: 'Buat Jadwal', roles: ['IT_ADMIN', 'ADMIN', 'DOSEN'] },
  { to: '/users', icon: Users, label: 'Manajemen User', roles: ['IT_ADMIN'] },
]

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role))

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : ''}`}>
      <div className="p-5 border-b border-indigo-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Sistem Jadwal</p>
            <p className="text-indigo-300 text-xs">Seminar &amp; Sidang</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/20 text-white'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-indigo-700">
        <div className="mb-3 px-3">
          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
          <div className="mt-1">
            <Badge value={user?.role} />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-indigo-800 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full bg-indigo-800">
            <button
              className="absolute top-4 right-4 text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar mobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center justify-between flex-shrink-0">
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 lg:flex-none">
            <h1 className="text-base font-semibold text-gray-900 hidden lg:block">
              {navItems.find((n) => location.pathname === n.to || (n.to !== '/dashboard' && location.pathname.startsWith(n.to)))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">{user?.name}</span>
            <Badge value={user?.role} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
