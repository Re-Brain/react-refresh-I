import { formatTime, getHorseVisitSlots } from '../api/availability'
import type { useBookingForm } from '../hooks/useBookingForm'

type BookingFormProps = {
  form: ReturnType<typeof useBookingForm>
  visitSlots: ReturnType<typeof getHorseVisitSlots>
}

// The booking form shown once a date is picked: time-slot picker (grouped by
// period), party size, note, and submit — or the confirmation once requested.
// All state and the submit flow live in the useBookingForm hook.
function BookingForm({ form, visitSlots }: BookingFormProps) {
  const { formRef, selectedDate, selectedSlot, setSelectedSlot, partySize, setPartySize, note, setNote, booking, submitting, submitError, handleSubmit } = form

  // Render the chosen day as e.g. "Saturday, 11 July 2026". Parse at local
  // midnight so the weekday doesn't shift across time zones.
  const prettyDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="scroll-mt-24 bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-5"
    >
      <p className="text-sm text-brand-muted">
        Visiting on{' '}
        <span className="font-bold text-brand-text">{prettyDate}</span>
      </p>

      {/* Time slot — grouped by period, from the farm's schedule */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-brand-muted uppercase">
          Choose a time
        </label>
        {visitSlots.map(({ period, slots }) => (
          <div key={period.key} className="flex flex-col gap-2">
            <span className="text-xs font-bold text-brand-text">{period.label}</span>
            <div className="flex flex-wrap gap-2">
              {slots.map(s => {
                const active =
                  selectedSlot?.period === period.key &&
                  selectedSlot.start === s.start &&
                  selectedSlot.end === s.end
                return (
                  <button
                    key={`${s.start}-${s.end}`}
                    type="button"
                    onClick={() =>
                      setSelectedSlot({ period: period.key, start: s.start, end: s.end })
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${
                      active
                        ? 'bg-brand-gold text-white border-brand-gold'
                        : 'border-brand-border text-brand-text hover:border-brand-gold'
                    }`}
                  >
                    {formatTime(s.start)}–{formatTime(s.end)}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Party size */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-brand-muted uppercase">
          Number of visitors
        </label>
        <select
          value={partySize}
          onChange={e => setPartySize(Number(e.target.value))}
          className="w-32 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
        >
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Note */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-brand-muted uppercase">
          Note to the farm <span className="normal-case font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={e => setNote(e.target.value)}
          className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold resize-none"
        />
      </div>

      {booking ? (
        <p className="text-brand-gold text-sm font-bold">
          Visit requested for {prettyDate}
          {`, ${formatTime(booking.start)}–${formatTime(booking.end)}`}
          . The farm will confirm your booking.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {submitError && <p className="text-red-600 text-sm">{submitError}</p>}
          <button
            type="submit"
            disabled={!selectedSlot || submitting}
            className="self-start bg-brand-gold text-white font-bold px-6 py-2.5 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
          >
            {submitting ? 'Requesting…' : 'Request visit'}
          </button>
        </div>
      )}
    </form>
  )
}

export default BookingForm
