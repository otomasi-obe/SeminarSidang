import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './layouts/AppLayout'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SchedulesPage from './pages/SchedulesPage'
import ScheduleDetailPage from './pages/ScheduleDetailPage'
import CreateSchedulePage from './pages/CreateSchedulePage'
import EditSchedulePage from './pages/EditSchedulePage'
import UsersPage from './pages/UsersPage'
import NotFoundPage from './pages/NotFoundPage'

function AuthenticatedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <AuthenticatedLayout>
                <DashboardPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/schedules"
            element={
              <AuthenticatedLayout>
                <SchedulesPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/schedules/create"
            element={
              <ProtectedRoute roles={['IT_ADMIN', 'ADMIN', 'DOSEN']}>
                <AppLayout>
                  <CreateSchedulePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedules/:id"
            element={
              <AuthenticatedLayout>
                <ScheduleDetailPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/schedules/:id/edit"
            element={
              <ProtectedRoute roles={['IT_ADMIN', 'ADMIN']}>
                <AppLayout>
                  <EditSchedulePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['IT_ADMIN']}>
                <AppLayout>
                  <UsersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
