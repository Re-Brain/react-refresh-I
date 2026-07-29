import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, Info, Loader2 } from 'lucide-react'
import { getStripeStatus, createStripeOnboardingLink } from '../api/donationDashboard'

const POLL_ATTEMPTS = 5
const POLL_DELAY_MS = 2000

type Phase = 'checking' | 'success' | 'incomplete'

// Stripe redirects here the instant the farmer finishes (or exits) the
// Connect onboarding form. `connected` is already true at this point (the
// account was created before onboarding started), but `payouts_enabled` may
// briefly still be false even on a successful completion — that field only
// flips once our backend's webhook hears back from Stripe. Poll a few times
// to catch that lag, but a farmer bailing out partway through the form is a
// completely normal outcome too, not a failure — after a fixed number of
// retries this settles into a neutral "not finished yet" state with a way to
// resume, rather than spinning forever.
function StripeReturnPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('checking')
  const [resuming, setResuming] = useState(false)
  const [resumeError, setResumeError] = useState<string | null>(null)

  useEffect(() => {
    sessionStorage.setItem('dashboardSection', 'donations')
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/dashboard/farmer', { replace: true })
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    async function poll(attempt: number) {
      try {
        const status = await getStripeStatus(token!)
        if (cancelled) return
        if (status.payouts_enabled) {
          setPhase('success')
          return
        }
      } catch {
        // Ignore and keep retrying — only give up once attempts run out.
      }
      if (cancelled) return
      if (attempt >= POLL_ATTEMPTS) {
        setPhase('incomplete')
        return
      }
      timer = setTimeout(() => poll(attempt + 1), POLL_DELAY_MS)
    }

    poll(1)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [navigate])

  async function resumeOnboarding() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setResuming(true)
    setResumeError(null)
    try {
      const { onboarding_url } = await createStripeOnboardingLink(token)
      window.location.href = onboarding_url
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : 'Failed to restart Stripe onboarding.')
      setResuming(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-xl p-10 flex flex-col items-center text-center gap-4">
        {phase === 'checking' && (
          <>
            <Loader2 size={48} className="text-brand-gold animate-spin" strokeWidth={1.5} />
            <h1 className="text-xl font-bold text-brand-text">Confirming with Stripe…</h1>
            <p className="text-brand-muted text-sm">
              Setup submitted — just double-checking everything went through.
            </p>
          </>
        )}

        {phase === 'success' && (
          <>
            <CheckCircle2 size={48} className="text-brand-gold" strokeWidth={1.5} />
            <h1 className="text-xl font-bold text-brand-text">Stripe connected!</h1>
            <p className="text-brand-muted text-sm">You can now receive donations to your farm.</p>
          </>
        )}

        {phase === 'incomplete' && (
          <>
            <Info size={48} className="text-brand-muted" strokeWidth={1.5} />
            <h1 className="text-xl font-bold text-brand-text">Stripe setup isn&rsquo;t complete yet</h1>
            <p className="text-brand-muted text-sm">
              No rush — you can pick up right where you left off anytime.
            </p>
            {resumeError && <p className="text-red-600 text-sm">{resumeError}</p>}
            <button
              type="button"
              onClick={resumeOnboarding}
              disabled={resuming}
              className="mt-2 bg-brand-gold text-white font-bold px-6 py-2.5 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
            >
              {resuming ? 'Redirecting…' : 'Finish Stripe setup'}
            </button>
          </>
        )}

        <Link
          to="/dashboard/farmer"
          className="mt-4 text-brand-muted hover:text-brand-gold font-bold text-sm transition"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

export default StripeReturnPage
