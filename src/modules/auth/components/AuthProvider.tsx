import { useEffect, useState } from 'react'
import { getMe, logout as logoutRequest } from '../api'
import type { UserMe } from '../api'
import { AuthContext } from '../context/AuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
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
