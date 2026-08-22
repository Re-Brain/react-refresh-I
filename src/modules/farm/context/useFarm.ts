import { useContext } from 'react'
import { FarmContext } from './FarmContext'

export function useFarm() {
  const ctx = useContext(FarmContext)
  if (!ctx) throw new Error('useFarm must be used inside FarmProvider')
  return ctx
}
