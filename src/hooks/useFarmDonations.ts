import { useState, useEffect } from 'react'
import {
  getStripeStatus,
  createStripeOnboardingLink,
  getMyDonations,
  type StripeStatus,
  type FarmDonation,
} from '../api/donationDashboard'

// Owns the farmer dashboard's Donations tab: the farm's Stripe connection
// status, its donation history, and the "Connect Stripe" hand-off flow.
export function useFarmDonations() {
  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [donations, setDonations] = useState<FarmDonation[]>([])
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('access_token')))
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  function fetchData(token: string) {
    Promise.all([getStripeStatus(token), getMyDonations(token)])
      .then(([nextStatus, nextDonations]) => {
        setStatus(nextStatus)
        setDonations(nextDonations)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load donation data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    fetchData(token)
  }, [])

  function retry() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setLoading(true)
    setError(null)
    fetchData(token)
  }

  async function connectStripe() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setConnecting(true)
    setConnectError(null)
    try {
      const { onboarding_url } = await createStripeOnboardingLink(token)
      // Full top-level navigation — this is Stripe's hosted onboarding form,
      // not a route in this app.
      window.location.href = onboarding_url
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Failed to start Stripe onboarding.')
      setConnecting(false)
    }
  }

  return { status, donations, loading, error, retry, connecting, connectError, connectStripe }
}
