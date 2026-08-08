const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export type StripeStatus = {
  connected: boolean
  payouts_enabled: boolean
}

export type FarmDonation = {
  id: number
  amount_yen: number
  donor_name: string | null
  created_at: string
}

// Whether the logged-in farmer has started/finished connecting Stripe.
export async function getStripeStatus(token: string): Promise<StripeStatus> {
  const res = await fetch(`${API_BASE_URL}/farms/me/stripe/status`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to load Stripe connection status.')
  return res.json()
}

// Creates (or reuses) the farm's Connect account and returns a fresh
// onboarding link to redirect the farmer to.
export async function createStripeOnboardingLink(token: string): Promise<{ onboarding_url: string }> {
  const res = await fetch(`${API_BASE_URL}/farms/me/stripe/onboard`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to start Stripe onboarding.')
  return res.json()
}

// All donations received at the logged-in farmer's farm, newest first.
export async function getMyDonations(token: string): Promise<FarmDonation[]> {
  const res = await fetch(`${API_BASE_URL}/farms/me/donations`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to load donations.')
  return res.json()
}
