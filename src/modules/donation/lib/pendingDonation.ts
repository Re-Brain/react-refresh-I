const STORAGE_KEY = 'pendingDonation'

export type PendingDonation = {
  farmId: number
  farmName: string
  amount: number
}

// Stashed right before redirecting to Stripe Checkout — the success/cancel
// pages have no backend endpoint to look the donation up by (the webhook that
// records it may not have run yet), so this is the only source they have.
export function stashPendingDonation(donation: PendingDonation): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(donation))
}

// Doesn't clear — the cancel page reuses this to link back to the right farm
// without discarding it, in case the visitor wants to retry.
export function readPendingDonation(): PendingDonation | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PendingDonation
  } catch {
    return null
  }
}

export function clearPendingDonation(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}
