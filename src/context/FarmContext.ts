import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { Farm } from '../api/farm'
import type { Horse } from '../api/horse'

export type FarmContextType = {
  farm: Farm | null
  setFarm: Dispatch<SetStateAction<Farm | null>>
  horses: Horse[]
  setHorses: Dispatch<SetStateAction<Horse[]>>
  loading: boolean
  loadError: string | null
  horsesError: string | null
  retryFarm: () => void
  retryHorses: () => void
  profileComplete: boolean
  // True once the farm has cleared admin review — this is what actually
  // unlocks horse management, availability, visitor management, and Stripe/
  // payouts, as opposed to `profileComplete` which only covers the form fields.
  farmActive: boolean
}

export const FarmContext = createContext<FarmContextType | null>(null)
