import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { readPendingDonation, clearPendingDonation } from '../lib/pendingDonation'

// Landed on after a successful Stripe Checkout redirect (/donate/success).
// There's no backend endpoint to look the donation up by yet — the webhook
// that records it may not have run by the time this loads — so this just
// replays what useDonation stashed right before the redirect to Stripe.
function DonateSuccessPage() {
  // Lazy initializer so this reads (and clears) sessionStorage exactly once,
  // on mount, without a setState-in-effect.
  const [donation] = useState(() => {
    const pending = readPendingDonation()
    clearPendingDonation()
    return pending
  })

  return (
    <div className="min-h-[calc(100vh-3.25rem)] bg-brand-bg text-brand-text flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-brand-surface border border-brand-border rounded-xl p-10 flex flex-col items-center text-center gap-4">
        <CheckCircle2 size={56} className="text-brand-gold" strokeWidth={1.5} />

        <h1 className="text-2xl font-bold text-brand-text">Thank you!</h1>

        <p className="text-brand-muted text-sm leading-relaxed">
          {donation ? (
            <>
              Thanks for donating{' '}
              <span className="font-bold text-brand-text">¥{donation.amount.toLocaleString()}</span> to{' '}
              <span className="font-bold text-brand-text">{donation.farmName}</span>!
            </>
          ) : (
            'Thanks for your donation!'
          )}
        </p>

        <Link
          to="/farms"
          replace
          className="mt-4 bg-brand-gold text-white font-bold px-6 py-2.5 rounded-lg hover:bg-brand-gold-light transition text-sm"
        >
          Browse more farms
        </Link>
      </div>
    </div>
  )
}

export default DonateSuccessPage
