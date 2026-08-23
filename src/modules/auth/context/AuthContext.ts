import { createContext } from 'react'
import type { UserMe } from '../api'

export type AuthContextType = {
  user: UserMe | null
  setUser: (user: UserMe | null) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)
