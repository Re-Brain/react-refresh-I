import { useState, useEffect } from 'react'
import { getMyBookings, cancelBooking, type VisitorBooking } from '../api'

// Loads the visitor's bookings and owns the cancel flow: the per-card confirm
// prompt (`confirmId`), the in-flight card (`busyId`), and action errors.
export function useVisitorBookings() {
  const [bookings, setBookings] = useState<VisitorBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function fetchBookings() {
    getMyBookings()
      .then(setBookings)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load your bookings.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  function handleRetry() {
    setLoading(true)
    setError(null)
    fetchBookings()
  }

  // Manual refresh once bookings are already showing — keeps the existing
  // cards on screen (unlike handleRetry, this doesn't flip back to the
  // full-section loading state).
  function refresh() {
    if (refreshing) return
    setRefreshing(true)
    setError(null)
    getMyBookings()
      .then(setBookings)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load your bookings.'))
      .finally(() => setRefreshing(false))
  }

  // Open the confirm prompt on a card.
  function requestCancel(id: number) {
    setConfirmId(id)
    setActionError(null)
  }

  // Back out of the confirm prompt.
  function keepCancel() {
    setConfirmId(null)
  }

  async function cancel(id: number) {
    setBusyId(id)
    setActionError(null)
    try {
      const updated = await cancelBooking(id)
      setBookings(prev => prev.map(b => (b.id === updated.id ? updated : b)))
      setConfirmId(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel the booking.')
    } finally {
      setBusyId(null)
    }
  }

  return { bookings, loading, refreshing, refresh, error, actionError, handleRetry, confirmId, busyId, requestCancel, keepCancel, cancel }
}
