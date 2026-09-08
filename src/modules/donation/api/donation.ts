import { apiFetch } from '../../../lib/apiFetch'
import { formatRateLimitMessage } from '../../../lib/rateLimit'

export type DonationCheckoutSession = {
  checkout_url: string
}

// Carries the HTTP status so the UI can branch (404 → farm missing, 409 →
// farm hasn't onboarded with Stripe yet, 422 → invalid amount) with a message
// from `detail`.
export class DonationError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'DonationError'
    this.status = status
  }
}

// `detail` is a human-readable string for the business errors (404/409). For
// 422s it's an array of raw Pydantic field errors — not something to show a
// visitor verbatim, so those fall back to the generic per-status message.
function messageFromDetail(detail: unknown, fallback: string): string {
  return typeof detail === 'string' ? detail : fallback
}

function defaultMessage(status: number): string {
  switch (status) {
    case 404:
      return 'Farm not found.'
    case 409:
      return "This farm can't accept donations yet."
    case 422:
      return 'Please enter a valid donation amount.'
    default:
      return 'Failed to start the donation. Please try again.'
  }
}

export type FxEstimate = {
  jpy_amount: number
  currency: string
  converted_amount: number
  rate_date: string
}

// A purely-informational currency estimate for a yen amount — never used in
// the actual checkout flow, which always deals in JPY. Callers should treat
// ANY failure (unsupported currency, rate service down, network error) the
// same way: silently don't show an estimate. This is a nice-to-have display,
// not something that should ever surface an error or block donating.
export async function getFxEstimate(amount: number, currency: string): Promise<FxEstimate> {
  const res = await apiFetch(`/donations/fx-estimate?amount=${amount}&to=${encodeURIComponent(currency)}`)
  if (!res.ok) throw new Error('Failed to load currency estimate.')
  return res.json()
}

// Creates a Stripe Checkout Session for a one-time yen donation to a farm.
// Works for logged-out visitors too — the session cookie (and CSRF header) is
// only present/sent when the visitor is actually logged in.
export async function createDonationCheckoutSession(
  farmId: number,
  amount: number,
): Promise<DonationCheckoutSession> {
  const res = await apiFetch('/donations/checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ farm_id: farmId, amount }),
  })
  if (res.status === 429) {
    throw new DonationError(429, formatRateLimitMessage(res))
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new DonationError(res.status, messageFromDetail(body?.detail, defaultMessage(res.status)))
  }
  return res.json()
}
