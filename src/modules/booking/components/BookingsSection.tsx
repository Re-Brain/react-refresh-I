import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarClock, RefreshCw, Users } from 'lucide-react'
import type { BookingStatus } from '../api'
import { STATUS_LABELS } from '../lib/bookingDisplay'
import { useVisitorBookings } from '../hooks/useVisitorBookings'
import BookingStatusTabs from './BookingStatusTabs'
import BookingCard from './BookingCard'

// The Bookings section: status filter buttons and the selected status's cards,
// with loading / error / empty states. Confirmed is shown by default. Owns
// its own bookings data and cancel flow (useVisitorBookings).
function BookingsSection() {
  const { bookings, loading, refreshing, refresh, error, actionError, handleRetry, confirmId, busyId, requestCancel, cancel, keepCancel } = useVisitorBookings()

  // Which status is being viewed. Confirmed is shown by default.
  const [active, setActive] = useState<BookingStatus>('confirmed')

  // Count per status for the tab badges.
  const counts: Record<BookingStatus, number> = { confirmed: 0, cancelled: 0 }
  for (const b of bookings) counts[b.status]++

  // Cards for the selected status, soonest visit first.
  const visible = bookings
    .filter(b => b.status === active)
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))

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

  if (bookings.length === 0)
    return (
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 text-center flex flex-col items-center gap-3">
        <CalendarClock size={28} className="text-brand-muted" />
        <p className="text-brand-muted text-sm">You haven&rsquo;t booked any visits yet.</p>
        <Link
          to="/horses"
          className="bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm"
        >
          Browse horses
        </Link>
      </div>
    )

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-brand-text">Bookings</h2>
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

      {/* Status filter — click a button to show that status's cards. */}
      <BookingStatusTabs active={active} onSelect={setActive} counts={counts} />

      {actionError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
          <AlertTriangle size={18} className="shrink-0" />
          <p>{actionError}</p>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-lg p-8 text-center flex flex-col items-center gap-3">
          <Users size={28} className="text-brand-muted" />
          <p className="text-brand-muted text-sm">No {STATUS_LABELS[active].toLowerCase()} bookings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {visible.map(b => (
            <BookingCard
              key={b.id}
              booking={b}
              confirming={confirmId === b.id}
              busy={busyId === b.id}
              onRequestCancel={() => requestCancel(b.id)}
              onConfirmCancel={() => cancel(b.id)}
              onKeepCancel={keepCancel}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default BookingsSection
