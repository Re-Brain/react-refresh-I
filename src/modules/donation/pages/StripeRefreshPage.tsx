import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createStripeOnboardingLink } from '../api/donationDashboard'

// Stripe redirects here if the onboarding link from POST /farms/me/stripe/
// onboard expired or was invalidated before the farmer finished. Immediately
// request a fresh link and continue, rather than stranding them on a dead page.
function StripeRefreshPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    sessionStorage.setItem('dashboardSection', 'donations')
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/dashboard/farmer', { replace: true })
      return
    }
    createStripeOnboardingLink(token)
      .then(({ onboarding_url }) => {
        window.location.href = onboarding_url
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to restart Stripe onboarding.')
      })
  }, [navigate])

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center gap-4 text-center px-6">
      {error ? (
        <>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/farmer', { replace: true })}
            className="bg-brand-gold text-white font-bold px-6 py-2.5 rounded-lg hover:bg-brand-gold-light transition text-sm"
          >
            Back to dashboard
          </button>
        </>
      ) : (
        <p className="text-brand-muted text-sm">Getting you a fresh Stripe link…</p>
      )}
    </div>
  )
}

export default StripeRefreshPage
