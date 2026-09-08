import { useLocation, Navigate, Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import type { Booking } from '../api'
import { formatTime } from '../../farm'
import { formatVisitDate } from '../lib/bookingDisplay'

// Shown right after a visitor books a visit. The just-created booking travels
// in router state (set by useBookingForm on success) — if it's missing, e.g.
// the page was reloaded directly, there's nothing to confirm, so bounce to
// the horse list instead of rendering a blank page. A booking is confirmed
// the instant it's created, so this always shows the confirmed state.
function BookingConfirmationPage() {
  const location = useLocation()
  const booking = (location.state as { booking?: Booking } | null)?.booking

  if (!booking) return <Navigate to="/horses" replace />

  return (
    <div className="min-h-[calc(100vh-3.25rem)] bg-brand-bg text-brand-text flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-brand-surface border border-brand-border rounded-xl p-10 flex flex-col items-center text-center gap-4">
        <CheckCircle2 size={56} className="text-brand-gold" strokeWidth={1.5} />

        <h1 className="text-2xl font-bold text-brand-text">You&rsquo;re confirmed!</h1>

        <p className="text-brand-muted text-sm leading-relaxed">
          Your visit for{' '}
          <span className="font-bold text-brand-text">{booking.horse_name ?? 'this horse'}</span>
          {booking.farm_name && (
            <>
              {' '}
              at <span className="font-bold text-brand-text">{booking.farm_name}</span>
            </>
          )}{' '}
          on <span className="font-bold text-brand-text">{formatVisitDate(booking.date)}</span>,{' '}
          {formatTime(booking.start)}–{formatTime(booking.end)} is confirmed. See you then!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
          <Link
            to="/dashboard/visitor"
            className="flex-1 bg-brand-gold text-brand-bg font-bold px-4 py-2.5 rounded-lg hover:bg-brand-gold-light transition text-sm"
          >
            Look at your booking
          </Link>
          <Link
            to="/horses"
            className="flex-1 border border-brand-border text-brand-text font-bold px-4 py-2.5 rounded-lg hover:border-brand-gold hover:text-brand-gold transition text-sm"
          >
            Visit more horses
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmationPage
