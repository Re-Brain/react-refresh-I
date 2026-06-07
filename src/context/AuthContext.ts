import { createContext } from 'react'
import type { UserMe } from '../api/auth'

export type AuthContextType = {
  user: UserMe | null
  setUser: (user: UserMe | null) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)
