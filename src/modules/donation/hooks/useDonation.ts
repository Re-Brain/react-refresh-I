import { useState } from 'react'
import { createDonationCheckoutSession, DonationError } from '../api/donation'
import { stashPendingDonation } from '../lib/pendingDonation'

export const MIN_DONATION_AMOUNT = 100

// Owns the "Support this farm" form: the yen amount, the submit flow, and
// handing off to Stripe Checkout. Works for logged-out visitors too — the
// auth token is only attached when one exists.
export function useDonation(farmId: number, farmName: string) {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return { amount, setAmount, submitting, error, donate }
}
