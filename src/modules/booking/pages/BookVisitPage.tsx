import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getHorseVisitSlots } from '../../farm'
import { useAuth } from '../../auth'
import Calendar from '../../../components/Calendar'
import BookingForm from '../components/BookingForm'
import { useBookVisitData } from '../hooks/useBookVisitData'
import { useBookingForm } from '../hooks/useBookingForm'
import { useHorseAvailability } from '../hooks/useHorseAvailability'

function BookVisitPage() {
  const { horseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { horse, farm, myBookings, loading, error } = useBookVisitData(horseId)
  const form = useBookingForm(horseId)
  // Live capacity for whichever date is currently picked — re-fetched on every
  // date change. `availabilityNotFound` means the horse disappeared/became
  // unapproved after this page already loaded it.
  const { fullPeriods, notFound: availabilityNotFound } = useHorseAvailability(horseId, form.selectedDate)

  if (loading)
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">
        Loading...
      </div>
    )

  // A draft/pending/rejected horse isn't meant to be public yet — treat it
  // exactly like "not found" rather than letting the booking flow proceed
  // for a horse an admin hasn't approved.
  if (error || !horse || horse.status !== 'approved' || availabilityNotFound)
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-red-600">
        {error ?? 'Horse not found'}
      </div>
    )

  // Visit options for this horse: the farm's schedule, filtered to the periods
  // this horse takes part in (both arrive on the public horse response). Booking
  // is open only when the account isn't a farm/admin account (matches the same
  // restriction already applied to donations), the farm accepts visits, is open
  // on some weekday, and this horse has at least one offered slot.
  const farmAvailability = horse.farm_availability
  const visitSlots = getHorseVisitSlots(farmAvailability, horse.periods)
  const canBook = user?.role !== 'admin' && user?.role !== 'farmer'
  const bookingOpen =
    canBook &&
    farmAvailability.enabled &&
    farmAvailability.weekdays.length > 0 &&
    visitSlots.length > 0

  // Periods the visitor already has a confirmed booking for on the selected
  // date, for this horse — greyed out in the slot picker below so they can't
  // pick a slot the server would just reject as a duplicate.
  const alreadyBookedPeriods = new Set(
    myBookings
      .filter(b => b.horse_id === Number(horseId) && b.date === form.selectedDate && b.status === 'confirmed')
      .map(b => b.period)
  )

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
        {/* min-w-0 overrides a grid item's default min-width:auto — without
            it, wrapping text (or any wide descendant) can force this item,
            the grid, and the whole page wider instead of actually wrapping
            to fit the available column width. */}
        <div className="min-w-0 bg-brand-gold text-white flex items-center p-6 xs:p-8 sm:p-10 lg:p-16 lg:sticky lg:top-16 lg:self-start lg:h-[calc(100vh-4rem-1px)]">
          {/* mt-10 clears the fixed Back button pinned at top-20 — this
              heading renders first on mobile, so it would otherwise land
              right under that button. Not needed at lg. */}
          <h1 className="text-left text-2xl xs:text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-wide leading-tight mt-10 lg:mt-0">
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
        <div className="min-w-0 flex items-center justify-center p-4 xs:p-6 sm:p-8 lg:p-16">
          <div className="w-full max-w-2xl flex flex-col gap-6">
            {!bookingOpen ? (
              <div className="bg-brand-surface border border-brand-border rounded-lg p-4 xs:p-6 text-brand-muted text-sm">
                {!canBook ? (
                  <>
                    Farm accounts can&rsquo;t book a visit. Log in with a visitor account to visit{' '}
                    <span className="font-bold text-brand-text">{horse.name}</span>.
                  </>
                ) : (
                  <>
                    <span className="font-bold text-brand-text">{horse.name}</span> isn&rsquo;t
                    currently available for visits. Please check back later.
                  </>
                )}
              </div>
            ) : (
              <>
                <Calendar
                  value={form.selectedDate}
                  onSelect={form.selectDate}
                  availableWeekdays={farmAvailability.weekdays}
                  minLeadDays={farmAvailability.min_lead_days}
                />

                {form.selectedDate && (
                  <BookingForm
                    form={form}
                    visitSlots={visitSlots}
                    alreadyBookedPeriods={alreadyBookedPeriods}
                    fullPeriods={fullPeriods}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default BookVisitPage
