import { useState, useEffect, useRef, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getHorsePublic, type Horse } from '../api/horse'
import { getFarm, type ActiveFarm } from '../api/farm'
import Calendar from '../components/Calendar'
import { LenisContext } from '../context/LenisContext'

function BookVisitPage() {
  const { horseId } = useParams()
  const navigate = useNavigate()
  const [horse, setHorse] = useState<Horse | null>(null)
  const [farm, setFarm] = useState<ActiveFarm | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | null>(null)
  const [partySize, setPartySize] = useState(1)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const lenisRef = useContext(LenisContext)

  // Slowly glide the form into view when a day is picked. Prefer Lenis (the
  // app's smooth-scroll engine, which disables native smooth scrolling) so we
  // get an animated scroll; fall back to scrollIntoView if Lenis is off.
  useEffect(() => {
    if (!selectedDate) return
    const el = formRef.current
    if (!el) return
    const lenis = lenisRef?.current
    if (lenis) {
      // Defer a frame so the just-mounted form is laid out, then tell Lenis to
      // recompute its scroll height — otherwise the very first scroll is
      // clamped to the old (form-less) page height and doesn't move.
      requestAnimationFrame(() => {
        lenis.resize()
        lenis.scrollTo(el, { offset: -96, duration: 1.4 })
      })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedDate, lenisRef])

  useEffect(() => {
    if (!horseId) return
    getHorsePublic(Number(horseId))
      .then(async h => {
        setHorse(h)
        if (h.farm_id != null) setFarm(await getFarm(h.farm_id))
      })
      .catch(() => setError('Horse not found'))
      .finally(() => setLoading(false))
  }, [horseId])

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Stubbed until src/api/booking.ts exists — just capture the payload.
    const payload = {
      horseId: Number(horseId),
      date: selectedDate,
      timeSlot,
      partySize,
      note,
    }
    console.log('Booking request:', payload)
    setSubmitted(true)
  }

  return (
    <div className="bg-brand-bg text-brand-text">
      {/* Pinned back button — stays in the viewport while scrolling, matching
          the horse detail page. */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-2 z-40 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Full-screen split: green heading panel on the left, calendar on the
          right — mirrors the horse detail hero. */}
      <section className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem-1px)]">
        {/* Left: context heading (Fraunces h1) on the racing-green panel.
            Pinned to the viewport on large screens so it stays put while the
            right column (calendar + form) scrolls. */}
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
            <Calendar
              value={selectedDate}
              onSelect={d => {
                setSelectedDate(d)
                setSubmitted(false)
              }}
            />

            {selectedDate && (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="scroll-mt-24 bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-5"
              >
                <p className="text-sm text-brand-muted">
                  Visiting on{' '}
                  <span className="font-bold text-brand-text">{prettyDate}</span>
                </p>

                {/* Time slot */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-brand-muted uppercase">
                    Time of day
                  </label>
                  <div className="flex gap-3">
                    {(['morning', 'afternoon'] as const).map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold border capitalize transition ${
                          timeSlot === slot
                            ? 'bg-brand-gold text-white border-brand-gold'
                            : 'border-brand-border text-brand-text hover:border-brand-gold'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
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

                {submitted ? (
                  <p className="text-brand-gold text-sm font-bold">
                    Visit requested for {prettyDate}. The farm will confirm your booking.
                  </p>
                ) : (
                  <button
                    type="submit"
                    disabled={!timeSlot}
                    className="self-start bg-brand-gold text-white font-bold px-6 py-2.5 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
                  >
                    Request visit
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default BookVisitPage
