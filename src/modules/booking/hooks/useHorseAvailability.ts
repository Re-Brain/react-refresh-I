import { useState, useEffect } from 'react'
import { getHorseAvailability, BookingError } from '../api'
import type { Period } from '../../farm'

const EMPTY_FULL_PERIODS: Set<Period> = new Set()

// Live capacity for the currently-selected date, refetched whenever the date
// changes. `fullPeriods` drives greying out an already-full slot before the
// visitor tries to pick it. A 404 means the horse disappeared/became
// unapproved since the page loaded — surfaced via `notFound` so the caller
// can fold it into the same "horse not found" state used elsewhere. Any
// other failure (401, network, etc.) is best-effort: this is a nice-to-have
// UI check, not the real guard — POST /bookings still enforces it for real.
export function useHorseAvailability(horseId: string | undefined, date: string | null) {
  // Tagged with the date it was fetched for, so a stale result from the
  // previous date can't leak through while the new date's fetch is in flight.
  const [result, setResult] = useState<{ date: string | null; fullPeriods: Set<Period> }>({
    date: null,
    fullPeriods: EMPTY_FULL_PERIODS,
  })
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!horseId || !date) return
    let cancelled = false
    getHorseAvailability(Number(horseId), date)
      .then(data => {
        if (cancelled) return
        const full = new Set<Period>()
        for (const [period, info] of Object.entries(data.periods) as [Period, { remaining: number }][]) {
          if (info.remaining <= 0) full.add(period)
        }
        setResult({ date, fullPeriods: full })
      })
      .catch(err => {
        if (cancelled) return
        if (err instanceof BookingError && err.status === 404) setNotFound(true)
      })
    return () => {
      cancelled = true
    }
  }, [horseId, date])

  // Only trust the cached result if it matches the currently-selected date —
  // otherwise (date just changed and the new fetch hasn't resolved yet, or no
  // date is picked at all) report nothing as full rather than briefly
  // showing stale data from the previous date.
  const fullPeriods = result.date === date ? result.fullPeriods : EMPTY_FULL_PERIODS
  return { fullPeriods, notFound }
}
