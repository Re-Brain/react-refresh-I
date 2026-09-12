import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import { readPendingDonation } from '../lib/pendingDonation'

// Landed on if the visitor backs out of Stripe Checkout without paying
// (/donate/cancel). No charge was made — this reuses whatever useDonation
// stashed before the redirect (without clearing it) so the link back can
// point at the right farm if they want to retry.
function DonateCancelPage() {
  const donation = readPendingDonation()

  return (
    <div className="min-h-[calc(100vh-3.25rem)] bg-brand-bg text-brand-text flex items-center justify-center p-4 xs:p-6 sm:p-8">
      <div className="w-full max-w-lg bg-brand-surface border border-brand-border rounded-xl p-6 xs:p-8 sm:p-10 flex flex-col items-center text-center gap-4">
        <XCircle size={56} className="text-brand-muted" strokeWidth={1.5} />

        <h1 className="text-2xl font-bold text-brand-text">Donation cancelled</h1>

        <p className="text-brand-muted text-sm leading-relaxed">
          No charge was made{donation ? ` to ${donation.farmName}` : ''}.
        </p>

        <Link
          to={donation ? `/farms/${donation.farmId}` : '/farms'}
          replace
          state={{ fromDonation: true }}
          className="mt-4 bg-brand-gold text-white font-bold px-6 py-2.5 rounded-lg hover:bg-brand-gold-light transition text-sm"
        >
          Back to farm
        </Link>
      </div>
    </div>
  )
}

export default DonateCancelPage
