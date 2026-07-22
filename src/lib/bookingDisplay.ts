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
