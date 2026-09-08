import { useState, useEffect } from 'react'
import { getHorsePublic, type Horse, getFarm, type ActiveFarm } from '../../farm'
import { getMyBookings, type VisitorBooking } from '../api'

// Loads the public horse being booked, its owning farm (for the heading), and
// the visitor's own existing bookings (so the form can grey out a horse/date/
// period they've already booked instead of letting them submit and fail).
export function useBookVisitData(horseId: string | undefined) {
  const [horse, setHorse] = useState<Horse | null>(null)
  const [farm, setFarm] = useState<ActiveFarm | null>(null)
  const [myBookings, setMyBookings] = useState<VisitorBooking[]>([])
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

    // Best-effort — this only drives the proactive "already booked" slot
    // disabling below. A guest (401) or any fetch failure here just means
    // that check doesn't fire; the server still rejects a genuine duplicate
    // on submit regardless.
    getMyBookings()
      .then(setMyBookings)
      .catch(() => {})
  }, [horseId])

  return { horse, farm, myBookings, loading, error }
}
