import { useState, useEffect } from 'react'
import { AlertTriangle, Mail, Users, RefreshCw, Ban } from 'lucide-react'
import {
  getFarmBookings,
  updateBookingStatus,
  type Booking,
  type BookingStatus,
} from '../api'
import { formatTime } from '../../farm'
import { formatVisitDate, displayStatus, isPastVisit } from '../lib/bookingDisplay'

type Filter = 'all' | BookingStatus

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
]

// Group order for the "All" tab — confirmed first, cancelled last. Single-
// status tabs ignore this (every row shares one status, so this comparison is
// always a tie there) and fall straight through to the date sort.
const STATUS_ORDER: BookingStatus[] = ['confirmed', 'cancelled']

// All visits booked at the farmer's farm, with the visitor's contact details.
// Fetched once (soonest-first from the server) and filtered by status client-side.
function VisitorManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  // The booking whose Cancel is in flight, and any action error.
  const [busyId, setBusyId] = useState<number | null>(null)
  // The booking (if any) currently showing the "cancel this visit?" reason
  // prompt, and the reason text being typed for it (optional — shown to the visitor).
  const [prompt, setPrompt] = useState<{ id: number } | null>(null)
  const [reason, setReason] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  function fetchBookings() {
    getFarmBookings()
      .then(setBookings)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load bookings.'))
      .finally(() => setLoading(false))
  }

  async function act(id: number, withReason?: string) {
    setBusyId(id)
    setActionError(null)
    try {
      const updated = await updateBookingStatus(id, 'cancelled', withReason)
      // Swap the updated booking into the list; the derived views/counts follow.
      setBookings(prev => prev.map(b => (b.id === updated.id ? updated : b)))
      setPrompt(null)
      setReason('')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update the booking.')
    } finally {
      setBusyId(null)
    }
  }

  // Open/close the cancel reason prompt on a given booking.
  function openPrompt(id: number) {
    setPrompt({ id })
    setReason('')
    setActionError(null)
  }

  function closePrompt() {
    setPrompt(null)
    setReason('')
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  function handleRetry() {
    setLoading(true)
    setError(null)
    fetchBookings()
  }

  // Manual refresh once bookings are already showing — keeps the table on
  // screen instead of flipping back to the full loading state.
  function refresh() {
    if (refreshing) return
    setRefreshing(true)
    setError(null)
    getFarmBookings()
      .then(setBookings)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load bookings.'))
      .finally(() => setRefreshing(false))
  }

  // Grouped by status (All tab only — a real no-op on single-status tabs),
  // then soonest-first by date and start time within each group.
  const visible = (filter === 'all' ? bookings : bookings.filter(b => b.status === filter))
    .slice()
    .sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
        a.date.localeCompare(b.date) ||
        a.start.localeCompare(b.start)
    )
  const countFor = (key: Filter) =>
    key === 'all' ? bookings.length : bookings.filter(b => b.status === key).length
  const promptBooking = prompt ? bookings.find(b => b.id === prompt.id) : undefined

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
      {/* Status filter + refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <button
          onClick={refresh}
          disabled={refreshing}
          title="Refresh bookings"
          aria-label="Refresh bookings"
          className="flex items-center gap-1.5 text-brand-muted hover:text-brand-gold font-bold text-xs px-3 py-1.5 rounded-lg border border-brand-border hover:border-brand-gold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
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
              : `No ${FILTERS.find(f => f.key === filter)?.label.toLowerCase()} visits.`}
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
                      className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${displayStatus(b).style}`}
                    >
                      {displayStatus(b).label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'confirmed' && !isPastVisit(b.date) ? (
                      <button
                        onClick={() => openPrompt(b.id)}
                        className="flex items-center gap-1 bg-red-500/10 text-red-600 border border-red-500/40 font-bold px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition text-xs"
                      >
                        <Ban size={14} /> Cancel visit
                      </button>
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

      {prompt && promptBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={closePrompt}
        >
          <div
            className="bg-brand-surface border border-brand-border rounded-xl p-6 w-full max-w-md flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-lg font-bold text-brand-text">Cancel this visit?</h3>
              <p className="text-brand-muted text-sm mt-1">
                {promptBooking.visitor_name ?? 'This visitor'}&rsquo;s visit to see{' '}
                <span className="font-bold text-brand-text">
                  {promptBooking.horse_name ?? 'this horse'}
                </span>{' '}
                on {formatVisitDate(promptBooking.date)}.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-muted uppercase">Reason for the visitor</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Let them know why…"
                rows={3}
                autoFocus
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => act(promptBooking.id, reason.trim())}
                disabled={busyId === promptBooking.id || !reason.trim()}
                className="flex-1 bg-red-600 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busyId === promptBooking.id ? 'Cancelling…' : 'Yes, cancel'}
              </button>
              <button
                onClick={closePrompt}
                disabled={busyId === promptBooking.id}
                className="flex-1 text-brand-muted hover:text-brand-text font-bold px-4 py-2.5 rounded-lg border border-brand-border transition text-sm disabled:opacity-50"
              >
                Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisitorManagement
