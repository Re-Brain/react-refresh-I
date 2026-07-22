import { useState, useEffect } from 'react'
import { AlertTriangle, Mail, Users, Check, X } from 'lucide-react'
import {
  getFarmBookings,
  updateBookingStatus,
  type Booking,
  type BookingStatus,
} from '../api/booking'
import { formatTime } from '../api/availability'
import { STATUS_STYLES, STATUS_LABELS, formatVisitDate } from '../lib/bookingDisplay'

type Filter = 'all' | BookingStatus

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'declined', label: 'Declined' },
  { key: 'cancelled', label: 'Cancelled' },
]

// All visits booked at the farmer's farm, with the visitor's contact details.
// Fetched once (soonest-first from the server) and filtered by status client-side.
function VisitorManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('access_token')))
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  // The booking whose Confirm/Decline is in flight, and any action error.
  const [busyId, setBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function fetchBookings(token: string) {
    getFarmBookings(token)
      .then(setBookings)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load bookings.'))
      .finally(() => setLoading(false))
  }

  async function act(id: number, status: 'confirmed' | 'declined') {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setBusyId(id)
    setActionError(null)
    try {
      const updated = await updateBookingStatus(token, id, status)
      // Swap the updated booking into the list; the derived views/counts follow.
      setBookings(prev => prev.map(b => (b.id === updated.id ? updated : b)))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update the booking.')
    } finally {
      setBusyId(null)
    }
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

  const visible = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)
  const countFor = (key: Filter) =>
    key === 'all' ? bookings.length : bookings.filter(b => b.status === key).length

  if (loading) return <p className="text-brand-muted text-sm">Loading…</p>

  if (error)
    return (
      <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
        <button
          onClick={handleRetry}
          className="bg-red-500/10 text-red-600 border border-red-500/40 font-bold px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-sm shrink-0"
        >
          Retry
        </button>
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-bold border transition ${
              filter === f.key
                ? 'bg-brand-gold text-brand-bg border-brand-gold'
                : 'border-brand-border text-brand-muted hover:text-brand-gold hover:border-brand-gold'
            }`}
          >
            {f.label} <span className="opacity-70">({countFor(f.key)})</span>
          </button>
        ))}
      </div>

      {actionError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
          <AlertTriangle size={18} className="shrink-0" />
          <p>{actionError}</p>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-lg p-8 text-center flex flex-col items-center gap-3">
          <Users size={28} className="text-brand-muted" />
          <p className="text-brand-muted text-sm">
            {bookings.length === 0
              ? 'No visits have been booked yet.'
              : 'No visits with this status.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-brand-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-brand-muted text-xs uppercase">
                <th className="text-left px-4 py-3 font-bold">Visitor</th>
                <th className="text-left px-4 py-3 font-bold">Horse</th>
                <th className="text-left px-4 py-3 font-bold">Date &amp; time</th>
                <th className="text-center px-4 py-3 font-bold">Party</th>
                <th className="text-left px-4 py-3 font-bold">Status</th>
                <th className="text-left px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(b => (
                <tr key={b.id} className="border-b border-brand-border last:border-0 align-top">
                  <td className="px-4 py-3">
                    <div className="font-bold text-brand-text">{b.visitor_name ?? 'Unknown'}</div>
                    <a
                      href={`mailto:${b.visitor_email}`}
                      className="flex items-center gap-1.5 text-brand-muted hover:text-brand-gold transition text-xs mt-0.5"
                    >
                      <Mail size={13} className="shrink-0" />
                      {b.visitor_email}
                    </a>
                    {b.note && (
                      <p className="text-brand-muted text-xs italic mt-1 max-w-xs">
                        &ldquo;{b.note}&rdquo;
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-brand-text">
                    {b.horse_name ?? 'Unknown horse'}
                  </td>
                  <td className="px-4 py-3 text-brand-text">
                    <div>{formatVisitDate(b.date)}</div>
                    <div className="text-brand-muted text-xs mt-0.5">
                      {formatTime(b.start)}–{formatTime(b.end)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-brand-text">{b.party_size}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[b.status]}`}
                    >
                      {STATUS_LABELS[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'pending' ? (
                      <div className="flex items-center justify-start gap-2">
                        <button
                          onClick={() => act(b.id, 'confirmed')}
                          disabled={busyId === b.id}
                          className="flex items-center gap-1 bg-green-500/10 text-green-600 border border-green-500/40 font-bold px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={14} /> Confirm
                        </button>
                        <button
                          onClick={() => act(b.id, 'declined')}
                          disabled={busyId === b.id}
                          className="flex items-center gap-1 bg-red-500/10 text-red-600 border border-red-500/40 font-bold px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X size={14} /> Decline
                        </button>
                      </div>
                    ) : (
                      <div className="text-left text-brand-muted text-xs">—</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default VisitorManagement
