import { useState, useEffect, useRef, useContext, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBooking, BookingError } from '../api'
import { LenisContext } from '../../../context/LenisContext'
import type { Period } from '../../../api/availability'

// A time slot the visitor has picked, tagged with the period it belongs to.
export type VisitSlot = { period: Period; start: string; end: string }

// Owns the booking form: chosen date/slot, party size, note, and the submit
// flow (which re-routes to login when the auth token is missing or expired).
// Also scrolls the form into view when a day is picked.
export function useBookingForm(horseId: string | undefined) {
  const navigate = useNavigate()
  const lenisRef = useContext(LenisContext)
  const formRef = useRef<HTMLFormElement>(null)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<VisitSlot | null>(null)
  const [partySize, setPartySize] = useState(1)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Glide the form into view once a day is picked. Prefer Lenis (the app's
  // smooth-scroll engine); defer a frame and call resize() first, or the very
  // first scroll is clamped to the old (form-less) page height. Fall back to
  // native scrollIntoView when Lenis is off.
  useEffect(() => {
    if (!selectedDate) return
    const el = formRef.current
    if (!el) return
    const lenis = lenisRef?.current
    if (lenis) {
      requestAnimationFrame(() => {
        lenis.resize()
        lenis.scrollTo(el, { offset: -96, duration: 1.4 })
      })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedDate, lenisRef])

  // Picking a new day clears any previous error.
  function selectDate(d: string | null) {
    setSelectedDate(d)
    setSubmitError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedDate || !selectedSlot) return
    const token = localStorage.getItem('access_token')
    // Auth-gated route, but the token can expire mid-session → send to login.
    if (!token) {
      navigate('/login', { state: { from: `/book/${horseId}` }, replace: true })
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const created = await createBooking(token, {
        horse_id: Number(horseId),
        date: selectedDate,
        period: selectedSlot.period,
        party_size: partySize,
        note: note || undefined,
      })
      navigate('/book/confirmation', { state: { booking: created } })
    } catch (err) {
      // Expired/invalid token → back to login, returning here afterwards.
      if (err instanceof BookingError && err.status === 401) {
        navigate('/login', { state: { from: `/book/${horseId}` }, replace: true })
        return
      }
      // Everything else (404/409/422) carries a human message in `detail`.
      setSubmitError(err instanceof Error ? err.message : 'Failed to book this visit.')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    formRef,
    selectedDate,
    selectDate,
    selectedSlot,
    setSelectedSlot,
    partySize,
    setPartySize,
    note,
    setNote,
    submitting,
    submitError,
    handleSubmit,
  }
}
