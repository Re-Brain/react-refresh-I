import { Link } from 'react-router-dom'
import { CalendarClock, Users, MapPin, ArrowUpRight } from 'lucide-react'
import type { VisitorBooking } from '../api'
import { formatTime } from '../../../api/availability'
import { formatVisitDate, displayStatus, isPastVisit } from '../lib/bookingDisplay'

type BookingCardProps = {
  booking: VisitorBooking
  /** Whether this card is currently showing the "are you sure?" cancel prompt. */
  confirming: boolean
  /** Whether this booking's cancellation request is in flight. */
  busy: boolean
  /** User clicked "Cancel visit" — open the confirm prompt. */
  onRequestCancel: () => void
  /** User confirmed with "Yes, cancel" — actually cancel. */
  onConfirmCancel: () => void
  /** User backed out with "Keep" — close the confirm prompt. */
  onKeepCancel: () => void
}

// A single visit booking rendered as a card: horse + farm, when, party size,
// status badge, and (while still pending/confirmed) an inline cancel flow.
// Purely presentational — all state lives in the parent, which passes the
// derived `confirming`/`busy` flags and the click handlers.
function BookingCard({
  booking: b,
  confirming,
  busy,
  onRequestCancel,
  onConfirmCancel,
  onKeepCancel,
}: BookingCardProps) {
  const status = displayStatus(b)

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-5 flex flex-col gap-4 hover:border-brand-gold/60 transition">
      {/* Top: label + status */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider text-brand-muted font-bold">
          Your visit
        </span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.style}`}>
          {status.label}
        </span>
      </div>

      {/* Middle: which horse, at which farm */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-brand-muted font-bold">
            Horse
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-extrabold text-brand-text text-2xl leading-tight line-clamp-2">
              {b.horse_name ?? 'Unknown horse'}
            </span>
            <Link
              to={`/horses/${b.horse_id}`}
              title="View horse"
              aria-label="View horse"
              className="shrink-0 text-brand-muted hover:text-brand-gold transition"
            >
              <ArrowUpRight size={16} />
            </Link>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-brand-muted font-bold">
            Farm
          </span>
          <span className="flex items-center gap-1.5 text-brand-text">
            <MapPin size={15} className="text-brand-gold shrink-0" />
            <span className="font-bold line-clamp-1">{b.farm_name ?? 'Unknown farm'}</span>
            <Link
              to={`/farms/${b.farm_id}`}
              title="View farm"
              aria-label="View farm"
              className="shrink-0 text-brand-muted hover:text-brand-gold transition"
            >
              <ArrowUpRight size={16} />
            </Link>
          </span>
        </div>
      </div>

      {/* Bottom: when + party size */}
      <div className="flex flex-col gap-1.5 text-sm border-t border-brand-border pt-3">
        <span className="flex items-center gap-1.5 text-brand-text">
          <CalendarClock size={15} className="text-brand-muted shrink-0" />
          {formatVisitDate(b.date)}
        </span>
        <div className="flex items-center justify-between text-brand-muted">
          <span>
            {formatTime(b.start)}–{formatTime(b.end)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={15} />
            {b.party_size} {b.party_size === 1 ? 'visitor' : 'visitors'}
          </span>
        </div>
      </div>

      {/* Why the farmer declined/cancelled it, if they gave a reason */}
      {(b.status === 'declined' || b.status === 'cancelled') && b.reason && (
        <p className="text-sm text-brand-muted border-t border-brand-border pt-3">
          <span className="font-bold text-brand-text">Reason: </span>
          {b.reason}
        </p>
      )}

      {/* Cancel — only while the visit is still pending/confirmed and hasn't happened yet */}
      {(b.status === 'pending' || b.status === 'confirmed') &&
        !isPastVisit(b.date) &&
        (confirming ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onConfirmCancel}
              disabled={busy}
              className="flex-1 bg-red-600 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? 'Cancelling…' : 'Yes, cancel'}
            </button>
            <button
              onClick={onKeepCancel}
              disabled={busy}
              className="flex-1 text-brand-muted hover:text-brand-text font-bold px-4 py-2.5 rounded-lg border border-brand-border transition text-sm disabled:opacity-50"
            >
              Keep
            </button>
          </div>
        ) : (
          <button
            onClick={onRequestCancel}
            className="w-full bg-red-600 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-red-700 transition text-sm"
          >
            Cancel visit
          </button>
        ))}
    </div>
  )
}

export default BookingCard
