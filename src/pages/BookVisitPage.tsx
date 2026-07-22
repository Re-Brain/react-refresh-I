import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getHorseVisitSlots } from '../api/availability'
import Calendar from '../components/Calendar'
import BookingForm from '../components/BookingForm'
import { useBookVisitData } from '../hooks/useBookVisitData'
import { useBookingForm } from '../hooks/useBookingForm'

function BookVisitPage() {
  const { horseId } = useParams()
  const navigate = useNavigate()

  const { horse, farm, loading, error } = useBookVisitData(horseId)
  const form = useBookingForm(horseId)

  if (loading)
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">
        Loading...
      </div>
    )

  if (error || !horse)
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-red-600">
        {error ?? 'Horse not found'}
      </div>
    )

  // Visit options for this horse: the farm's schedule, filtered to the periods
  // this horse takes part in (both arrive on the public horse response). Booking
  // is open only when the farm accepts visits, is open on some weekday, and this
  // horse has at least one offered slot.
  const farmAvailability = horse.farm_availability
  const visitSlots = getHorseVisitSlots(farmAvailability, horse.periods)
  const bookingOpen =
    farmAvailability.enabled &&
    farmAvailability.weekdays.length > 0 &&
    visitSlots.length > 0

  return (
    <div className="bg-brand-bg text-brand-text">
      {/* Pinned back button — stays in the viewport while scrolling. */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-2 z-40 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Full-screen split: green heading panel on the left, calendar + form on the right. */}
      <section className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem-1px)]">
        {/* Left: context heading, pinned on large screens while the right column scrolls. */}
        <div className="bg-brand-gold text-white flex items-center p-10 lg:p-16 lg:sticky lg:top-16 lg:self-start lg:h-[calc(100vh-4rem-1px)]">
          <h1 className="text-left text-4xl lg:text-6xl font-extrabold tracking-wide leading-tight">
            Book a visit to meet
            <br />
            <span className="text-amber-300">{horse.name}</span>
            {farm && (
              <>
                <br />
                at <span className="text-amber-300">{farm.name}</span>
              </>
            )}
          </h1>
        </div>

        {/* Right: pick a date, then fill in the visit details. */}
        <div className="flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-2xl flex flex-col gap-6">
            {!bookingOpen ? (
              <div className="bg-brand-surface border border-brand-border rounded-lg p-6 text-brand-muted text-sm">
                <span className="font-bold text-brand-text">{horse.name}</span> isn&rsquo;t
                currently available for visits. Please check back later.
              </div>
            ) : (
              <>
                <Calendar
                  value={form.selectedDate}
                  onSelect={form.selectDate}
                  availableWeekdays={farmAvailability.weekdays}
                />

                {form.selectedDate && <BookingForm form={form} visitSlots={visitSlots} />}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default BookVisitPage
