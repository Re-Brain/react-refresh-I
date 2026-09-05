import { useState, useEffect, useCallback } from 'react'
import { getMyFarm, isFarmComplete, type Farm } from '../api/farm'
import { getMyHorses, type Horse } from '../api/horse'

// Loads the farmer's farm and horses on mount, tracks their loading/error
// state, and exposes retry handlers. `profileComplete` gates the dashboard's
// locked sections. `enabled` lets callers (e.g. FarmProvider) skip the fetch
// entirely for non-farmer users instead of hitting endpoints that will 403.
export function useFarmData(enabled = true) {
  const [farm, setFarmRaw] = useState<Farm | null>(null)

  // `documents` is optional on the Farm type because several endpoints
  // (image upload/reorder/delete, the farm-info PATCH) don't echo it back in
  // their response. Replacing farm state wholesale with one of those
  // responses would silently wipe the already-uploaded documents from view
  // until the next refetch — merge the previous value back in instead.
  const setFarm = useCallback((next: Farm | null) => {
    setFarmRaw(prev => (prev && next && next.documents === undefined ? { ...next, documents: prev.documents } : next))
  }, [])
  const [horses, setHorses] = useState<Horse[]>([])
  const [loading, setLoading] = useState(enabled)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [horsesError, setHorsesError] = useState<string | null>(null)

  const loadFarm = useCallback(() => {
    getMyFarm()
      .then(setFarm)
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Failed to load your farm.'))
      .finally(() => setLoading(false))
  }, [setFarm])

  const loadHorses = useCallback(() => {
    getMyHorses()
      .then(setHorses)
      .catch(err => setHorsesError(err instanceof Error ? err.message : 'Failed to load your horses.'))
  }, [])

  useEffect(() => {
    if (!enabled) return
    loadFarm()
    loadHorses()
  }, [enabled, loadFarm, loadHorses])

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
