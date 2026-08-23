import { useEffect, useState } from 'react'
import { getMe, logout as logoutRequest } from '../api'
import type { UserMe } from '../api'
import { AuthContext } from '../context/AuthContext'
import { AUTH_LOGGED_OUT_EVENT } from '../../../lib/apiFetch'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  // Fired by apiFetch when a silent token refresh fails — the session is
  // truly over (not just this one request's access token expired).
  useEffect(() => {
    function handleLoggedOut() {
      setUser(null)
    }
    window.addEventListener(AUTH_LOGGED_OUT_EVENT, handleLoggedOut)
    return () => window.removeEventListener(AUTH_LOGGED_OUT_EVENT, handleLoggedOut)
  }, [])

  async function logout() {
    await logoutRequest()
    setUser(null)
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
