import type { BookingStatus } from '../api/booking'

// Badge styling and label per booking status — shared by the visitor dashboard
// and the farmer's visitor-management section.
export const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/40',
  confirmed: 'bg-green-500/10 text-green-600 border-green-500/40',
  declined: 'bg-red-500/10 text-red-600 border-red-500/40',
  cancelled: 'bg-brand-border/40 text-brand-muted border-brand-border',
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  declined: 'Declined',
  cancelled: 'Cancelled',
}

const EXPIRED_LABEL = 'Expired'
const EXPIRED_STYLE = 'bg-orange-500/10 text-orange-500 border-orange-500/40'

const COMPLETED_LABEL = 'Completed'
const COMPLETED_STYLE = 'bg-blue-500/10 text-blue-500 border-blue-500/40'

// "2026-07-25" → "Sat, 25 July 2026". Parse at local midnight so the weekday
// doesn't drift across time zones.
export function formatVisitDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// True once the visit date has passed (parsed at local midnight, same as
// formatVisitDate, so it doesn't drift across time zones).
export function isPastVisit(date: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${date}T00:00:00`) < today
}

// A booking still stuck at 'pending' once its visit date has gone by never
// got a farmer response in time — shown as "Expired" instead of "Pending". A
// 'confirmed' booking whose date has passed did happen (as far as the app
// knows) — shown as "Completed" instead. Both are purely display-time
// label/style overrides; the server-side status is untouched, so bookings
// still count and sort under their real status everywhere else.
export function displayStatus(b: { status: BookingStatus; date: string }): {
  label: string
  style: string
} {
  if (b.status === 'pending' && isPastVisit(b.date)) {
    return { label: EXPIRED_LABEL, style: EXPIRED_STYLE }
  }
  if (b.status === 'confirmed' && isPastVisit(b.date)) {
    return { label: COMPLETED_LABEL, style: COMPLETED_STYLE }
  }
  return { label: STATUS_LABELS[b.status], style: STATUS_STYLES[b.status] }
}
