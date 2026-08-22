import { useState, useEffect } from 'react'
import { getMyFarm, isFarmComplete, type Farm } from '../api/farm'
import { getMyHorses, type Horse } from '../api/horse'

// Loads the farmer's farm and horses on mount, tracks their loading/error
// state, and exposes retry handlers. `profileComplete` gates the dashboard's
// locked sections. `enabled` lets callers (e.g. FarmProvider) skip the fetch
// entirely for non-farmer users instead of hitting endpoints that will 403.
export function useFarmData(enabled = true) {
  const [farm, setFarm] = useState<Farm | null>(null)
  const [horses, setHorses] = useState<Horse[]>([])
  const [loading, setLoading] = useState(enabled)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [horsesError, setHorsesError] = useState<string | null>(null)

  function loadFarm() {
    getMyFarm()
      .then(setFarm)
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Failed to load your farm.'))
      .finally(() => setLoading(false))
  }

  function loadHorses() {
    getMyHorses()
      .then(setHorses)
      .catch(err => setHorsesError(err instanceof Error ? err.message : 'Failed to load your horses.'))
  }

  useEffect(() => {
    if (!enabled) return
    loadFarm()
    loadHorses()
  }, [enabled])

  function retryFarm() {
    setLoading(true)
    setLoadError(null)
    loadFarm()
  }

  function retryHorses() {
    setHorsesError(null)
    loadHorses()
  }

  const profileComplete = farm ? isFarmComplete(farm) : false

  return { farm, setFarm, horses, setHorses, loading, loadError, horsesError, retryFarm, retryHorses, profileComplete }
}
