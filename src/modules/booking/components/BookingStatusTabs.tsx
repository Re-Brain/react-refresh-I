import type { BookingStatus } from '../api'
import { STATUS_LABELS } from '../lib/bookingDisplay'

// Left-to-right order of the filter buttons.
const STATUS_ORDER: BookingStatus[] = ['confirmed', 'cancelled']

type BookingStatusTabsProps = {
  active: BookingStatus
  onSelect: (status: BookingStatus) => void
  counts: Record<BookingStatus, number>
}

// The status filter buttons. The active one is highlighted; each carries a
// count of how many bookings fall under it.
function BookingStatusTabs({ active, onSelect, counts }: BookingStatusTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_ORDER.map(status => {
        const isActive = status === active
        return (
          <button
            key={status}
            onClick={() => onSelect(status)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition ${
              isActive
                ? 'bg-brand-gold text-brand-bg border-brand-gold'
                : 'bg-brand-surface text-brand-muted border-brand-border hover:text-brand-gold hover:border-brand-gold'
            }`}
          >
            {STATUS_LABELS[status]}
            <span className={`text-xs ${isActive ? 'text-brand-bg/80' : 'text-brand-muted'}`}>
              {counts[status]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default BookingStatusTabs
