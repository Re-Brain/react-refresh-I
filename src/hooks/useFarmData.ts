import { useState, useEffect } from 'react'
import { getMyFarm, isFarmComplete, type Farm } from '../api/farm'
import { getMyHorses, type Horse } from '../api/horse'

// Loads the farmer's farm and horses on mount, tracks their loading/error
// state, and exposes retry handlers. `profileComplete` gates the dashboard's
// locked sections.
export function useFarmData() {
  const [farm, setFarm] = useState<Farm | null>(null)
  const [horses, setHorses] = useState<Horse[]>([])
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('access_token')))
  const [loadError, setLoadError] = useState<string | null>(null)
  const [horsesError, setHorsesError] = useState<string | null>(null)

  function loadFarm(token: string) {
    getMyFarm(token)
      .then(setFarm)
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Failed to load your farm.'))
      .finally(() => setLoading(false))
  }

  function loadHorses(token: string) {
    getMyHorses(token)
      .then(setHorses)
      .catch(err => setHorsesError(err instanceof Error ? err.message : 'Failed to load your horses.'))
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    loadFarm(token)
    loadHorses(token)
  }, [])

  function retryFarm() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setLoading(true)
    setLoadError(null)
    loadFarm(token)
  }

  function retryHorses() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setHorsesError(null)
    loadHorses(token)
  }

  const profileComplete = farm ? isFarmComplete(farm) : false

  return { farm, setFarm, horses, setHorses, loading, loadError, horsesError, retryFarm, retryHorses, profileComplete }
}
