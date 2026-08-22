import type { ActiveFarm } from '../api/farm'

type FarmLocationMapProps = {
  farm: ActiveFarm
}

// The farm's "Find Us" section — a full-bleed gold band with an embedded Google
// Map for the farm's location. Renders nothing when no location is set.
function FarmLocationMap({ farm }: FarmLocationMapProps) {
  if (!farm.location) return null

  return (
    <section className="relative left-1/2 right-1/2 mx-[-50vw] w-screen bg-brand-gold py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-8 flex flex-col gap-6">
        <h2
          style={{ fontFamily: 'var(--font-story-title)' }}
          className="text-3xl lg:text-4xl font-semibold tracking-wide text-white text-right"
        >
          Find Us
        </h2>
        <div className="overflow-hidden rounded-xl border-4 border-brand-border shadow-xl">
          <iframe
            title={`Map showing ${farm.name}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(farm.location)}&output=embed`}
            className="w-full h-80 lg:h-96 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}

export default FarmLocationMap
