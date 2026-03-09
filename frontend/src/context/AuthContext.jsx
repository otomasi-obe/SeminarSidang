import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const verifyToken = useCallback(async () => {
    const stored = localStorage.getItem('token')
    if (!stored) {
      setLoading(false)
      return
    }
    try {
      const { data } = await getMe()
      setUser(data.user || data)
      setToken(stored)
    } catch {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    verifyToken()
  }, [verifyToken])

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password)
    const t = data.token
    localStorage.setItem('token', t)
    setToken(t)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
