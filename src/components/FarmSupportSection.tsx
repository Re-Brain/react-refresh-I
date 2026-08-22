import { Heart } from 'lucide-react'
import { useDonation, MIN_DONATION_AMOUNT } from '../hooks/useDonation'
import { useAuth } from '../context/useAuth'

type FarmSupportSectionProps = {
  farmId: number
  farmName: string
  /** Whether the farm has finished Stripe onboarding and can accept donations. */
  payoutsEnabled: boolean
}

// Quick-pick shortcuts shown above the amount field — the input stays free-
// entry so a visitor can still type any amount they want.
const SUGGESTED_AMOUNTS = [100, 300, 500, 1000, 2000]

// The farm page's "Support this farm" panel — a yen amount input and a
// Donate button that hands off to Stripe Checkout. Works for guests too;
// donations don't require login.
function FarmSupportSection({ farmId, farmName, payoutsEnabled }: FarmSupportSectionProps) {
  const { user } = useAuth()
  const { amount, setAmount, submitting, error, donate } = useDonation(farmId, farmName)
  const canDonate = user?.role !== 'admin' && user?.role !== 'farmer'

  return (
    <section id="support-farm" className="flex flex-col gap-6 scroll-mt-24">
      <h2
        style={{ fontFamily: 'var(--font-story-title)' }}
        className="text-3xl lg:text-4xl font-semibold tracking-wide text-brand-gold text-left"
      >
        Support This Farm
      </h2>

      <div className="relative overflow-hidden bg-brand-surface border border-brand-border rounded-2xl shadow-sm p-8 lg:p-12 flex flex-col items-center gap-6 text-center">
        <div
          aria-hidden
          className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-brand-gold/30 via-brand-gold to-brand-gold/30"
        />

        <div className="flex flex-col items-center gap-3">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-gold/10 text-brand-gold">
            <Heart size={26} strokeWidth={1.75} fill="currentColor" />
          </span>
          <p className="text-sm text-brand-muted max-w-md leading-relaxed">
            {!canDonate ? (
              <>
                Farm and admin accounts can&rsquo;t make donations. Log in with a visitor account
                to support <span className="font-bold text-brand-text">{farmName}</span>.
              </>
            ) : payoutsEnabled ? (
              <>
                Your donation goes directly to{' '}
                <span className="font-bold text-brand-text">{farmName}</span> to help care for
                their horses.
              </>
            ) : (
              <>
                <span className="font-bold text-brand-text">{farmName}</span> hasn&rsquo;t set up
                donations yet — check back soon.
              </>
            )}
          </p>
        </div>

        {canDonate && payoutsEnabled && (
          <>
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-[0.15em]">
                Choose an amount (JPY) — ¥{MIN_DONATION_AMOUNT} minimum
              </label>

              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_AMOUNTS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold border transition hover:scale-105 ${
                      amount === String(preset)
                        ? 'bg-brand-gold text-white border-brand-gold shadow-sm'
                        : 'bg-brand-bg border-brand-border text-brand-text hover:border-brand-gold'
                    }`}
                  >
                    ¥{preset.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="relative w-full">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted font-bold">
                  ¥
                </span>
                <input
                  type="number"
                  min={MIN_DONATION_AMOUNT}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg pl-9 pr-4 py-3 text-brand-text text-lg font-bold text-center focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition"
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="button"
              onClick={donate}
              disabled={submitting}
              className="flex items-center gap-2 bg-brand-gold text-white font-bold uppercase tracking-[0.15em] text-sm px-12 py-3.5 rounded-full shadow-md hover:bg-brand-gold-light hover:scale-[1.03] transition disabled:opacity-50 disabled:hover:scale-100"
            >
              {submitting ? (
                'Redirecting…'
              ) : (
                <>
                  <Heart size={16} fill="currentColor" /> Donate
                </>
              )}
            </button>
          </>
        )}
      </div>
    </section>
  )
}

export default FarmSupportSection
