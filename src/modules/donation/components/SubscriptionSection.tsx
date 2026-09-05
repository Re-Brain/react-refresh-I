import { Star } from 'lucide-react'

type SubscriptionSectionProps = {
  userName?: string
}

// Placeholder for the not-yet-built subscription feature — just a welcome
// message for now.
function SubscriptionSection({ userName }: SubscriptionSectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-brand-text">Subscription</h2>
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 text-center flex flex-col items-center gap-3">
        <Star size={28} className="text-brand-gold" />
        <p className="text-brand-text font-bold">
          Subscriptions are coming soon{userName ? `, ${userName}` : ''}!
        </p>
        <p className="text-brand-muted text-sm max-w-md">
          Soon you&rsquo;ll be able to subscribe to your favourite farm with a recurring donation, helping support
          the horses you care about. Check back later.
        </p>
      </div>
    </section>
  )
}

export default SubscriptionSection
