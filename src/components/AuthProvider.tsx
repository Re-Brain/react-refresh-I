import { useEffect, useState } from 'react'
import { getMe } from '../api/auth'
import type { UserMe } from '../api/auth'
import { AuthContext } from '../context/AuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      getMe(token)
        .then(setUser)
        .catch(() => localStorage.removeItem('access_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function logout() {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
