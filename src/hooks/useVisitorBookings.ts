import { useState, useEffect } from 'react'
import { getMyBookings, cancelBooking, type VisitorBooking } from '../api/booking'

// Loads the visitor's bookings and owns the cancel flow: the per-card confirm
// prompt (`confirmId`), the in-flight card (`busyId`), and action errors.
export function useVisitorBookings() {
  const [bookings, setBookings] = useState<VisitorBooking[]>([])
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('access_token')))
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function fetchBookings(token: string) {
    getMyBookings(token)
      .then(setBookings)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load your bookings.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    fetchBookings(token)
  }, [])

  function handleRetry() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setLoading(true)
    setError(null)
    fetchBookings(token)
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
    const token = localStorage.getItem('access_token')
    if (!token) return
    setBusyId(id)
    setActionError(null)
    try {
      const updated = await cancelBooking(token, id)
      setBookings(prev => prev.map(b => (b.id === updated.id ? updated : b)))
      setConfirmId(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel the booking.')
    } finally {
      setBusyId(null)
    }
  }

  return { bookings, loading, error, actionError, handleRetry, confirmId, busyId, requestCancel, keepCancel, cancel }
}
