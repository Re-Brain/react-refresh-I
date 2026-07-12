import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Format a Y/M/D as a local 'YYYY-MM-DD' string (avoids the UTC shift you'd
// get from Date.toISOString()).
function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function Calendar({
  value,
  onSelect,
}: {
  value: string | null
  onSelect: (date: string) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [view, setView] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }))

  const firstWeekday = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()

  // Always render 6 rows (42 cells) so the calendar keeps a constant height as
  // you page between months — otherwise a 5- vs 6-week month makes the layout
  // jump. Leading blanks push day 1 under its weekday; trailing blanks fill out
  // the grid.
  const cells: (number | null)[] = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstWeekday + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  function goMonth(delta: number) {
    setView(v => {
      const m = v.month + delta
      return {
        year: v.year + Math.floor(m / 12),
        month: ((m % 12) + 12) % 12,
      }
    })
  }

  return (
    <div className="w-full bg-brand-surface border border-brand-border rounded-lg p-6">
      {/* Month header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          aria-label="Previous month"
          className="text-brand-muted hover:text-brand-gold p-1 rounded transition"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="font-bold text-brand-text">
          {MONTHS[view.month]} {view.year}
        </p>
        <button
          type="button"
          onClick={() => goMonth(1)}
          aria-label="Next month"
          className="text-brand-muted hover:text-brand-gold p-1 rounded transition"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div
            key={d}
            className="text-center text-xs font-bold uppercase text-brand-muted py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} className="h-14" />
          const iso = isoDate(view.year, view.month, day)
          const cellDate = new Date(view.year, view.month, day)
          const isPast = cellDate < today
          const isSelected = value === iso
          return (
            <button
              key={iso}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(iso)}
              className={`h-14 rounded-lg text-base font-bold transition ${
                isSelected
                  ? 'bg-brand-gold text-white'
                  : isPast
                  ? 'text-brand-muted/40 cursor-not-allowed'
                  : 'text-brand-text hover:bg-brand-bg'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
