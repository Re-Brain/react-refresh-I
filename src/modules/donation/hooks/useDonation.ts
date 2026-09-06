import { useState, useEffect } from 'react'
import { createDonationCheckoutSession, getFxEstimate, DonationError, type FxEstimate } from '../api/donation'
import { stashPendingDonation } from '../lib/pendingDonation'
import { detectVisitorCurrency } from '../lib/detectCurrency'

export const MIN_DONATION_AMOUNT = 100

// Owns the "Support this farm" form: the yen amount, the submit flow, and
// handing off to Stripe Checkout. Works for logged-out visitors too — the
// auth token is only attached when one exists.
export function useDonation(farmId: number, farmName: string) {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Best-effort "≈ $X (estimated)" display alongside the yen amount — purely
  // a courtesy, never part of the actual checkout. Debounced so typing a
  // custom amount doesn't fire a request per keystroke; a button click just
  // incurs the same short delay, which is imperceptible for a secondary line.
  // Tagged with the amount it was fetched for, so a stale estimate from a
  // previous amount can't leak through while a new fetch is in flight (or
  // never happens because the new amount is invalid/undetectable).
  const [estimateFor, setEstimateFor] = useState<{ amount: string; estimate: FxEstimate | null }>({
    amount: '',
    estimate: null,
  })

  // Resolved once on mount (from the visitor's IP, not their browser
  // language) — kicked off immediately, independent of the amount typed, so
  // it's usually already known by the time they enter one.
  const [visitorCurrency, setVisitorCurrency] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    detectVisitorCurrency().then(currency => {
      if (!cancelled) setVisitorCurrency(currency)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const parsedForEstimate = Number(amount)
  const amountEligibleForEstimate =
    Boolean(visitorCurrency) && Boolean(parsedForEstimate) && parsedForEstimate >= MIN_DONATION_AMOUNT

  useEffect(() => {
    if (!amountEligibleForEstimate) return
    let cancelled = false
    const timer = setTimeout(() => {
      getFxEstimate(parsedForEstimate, visitorCurrency!)
        .then(estimate => {
          if (!cancelled) setEstimateFor({ amount, estimate })
        })
        .catch(() => {
          // Any failure (unsupported currency, rate service down, network
          // error) just means no estimate shows — never an error the visitor
          // sees, and never something that blocks donating.
          if (!cancelled) setEstimateFor({ amount, estimate: null })
        })
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [amount, amountEligibleForEstimate, parsedForEstimate, visitorCurrency])

  const hasSettledForCurrentAmount = estimateFor.amount === amount
  const fxEstimate = hasSettledForCurrentAmount ? estimateFor.estimate : null
  // True from the moment a fetchable amount is entered until that fetch
  // settles (success or failure) — drives a "Calculating…" placeholder
  // instead of the estimate line popping in abruptly once it resolves.
  const loadingEstimate = amountEligibleForEstimate && !hasSettledForCurrentAmount

  async function donate() {
    const parsed = Number(amount)
    if (!parsed || parsed < MIN_DONATION_AMOUNT) {
      setError(`Please enter at least ¥${MIN_DONATION_AMOUNT}.`)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const { checkout_url } = await createDonationCheckoutSession(farmId, parsed)
      stashPendingDonation({ farmId, farmName, amount: parsed })
      // Full top-level navigation, not a client-side route — Stripe's
      // redirect-back needs this to be a real page load.
      window.location.href = checkout_url
    } catch (err) {
      setError(err instanceof DonationError ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return { amount, setAmount, submitting, error, donate, fxEstimate, loadingEstimate }
}
