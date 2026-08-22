import { useState, useEffect } from 'react'
import { getHorsePublic, type Horse, getFarm, type ActiveFarm } from '../../farm'

// Loads the public horse being booked and its owning farm (for the heading).
export function useBookVisitData(horseId: string | undefined) {
  const [horse, setHorse] = useState<Horse | null>(null)
  const [farm, setFarm] = useState<ActiveFarm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!horseId) return
    getHorsePublic(Number(horseId))
      .then(async h => {
        setHorse(h)
        if (h.farm_id != null) setFarm(await getFarm(h.farm_id))
      })
      .catch(() => setError('Horse not found'))
      .finally(() => setLoading(false))
  }, [horseId])

  return { horse, farm, loading, error }
}
