// Shared handling for the 429 responses login/register/verify-email/
// donations/bookings can now return. Retry-After is a response HEADER (not
// part of the JSON body), so this reads straight off the Response.
export function getRetryAfterSeconds(res: Response): number | null {
  const raw = res.headers.get('Retry-After')
  const seconds = raw ? Number(raw) : NaN
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null
}

// A 429 means "you were doing the right thing but doing it too fast," not
// "something is wrong with what you sent" — this is deliberately a different
// message shape than a 401/400/422, not a generic fallback for those.
export function formatRateLimitMessage(res: Response): string {
  const seconds = getRetryAfterSeconds(res)
  if (seconds === null) return 'Too many attempts. Please try again later.'
  const minutes = Math.ceil(seconds / 60)
  return `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
}
