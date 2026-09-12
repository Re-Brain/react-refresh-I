import type { Horse } from '../api/horse'
import OverlayCard from '../../../components/OverlayCard'

type FarmResidentsProps = {
  horses: Horse[]
  horsesError: boolean
}

// The farm's "Our Residents" section — a grid of horse cards linking to each
// horse's public page, with error and empty states.
function FarmResidents({ horses, horsesError }: FarmResidentsProps) {
  return (
    <section className="flex flex-col gap-6">
      <h2
        style={{ fontFamily: 'var(--font-story-title)' }}
        className="text-2xl xs:text-3xl lg:text-4xl font-semibold tracking-wide text-brand-gold text-left"
      >
        Our Residents
      </h2>

      {horsesError ? (
        <p className="text-red-600 text-sm text-center">Failed to load horses.</p>
      ) : horses.length === 0 ? (
        <p className="text-brand-muted text-sm text-center">
          No horses listed for this farm yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4 xs:gap-6">
          {horses.map(horse => (
            <OverlayCard
              key={horse.id}
              to={`/horses/${horse.id}`}
              imageUrl={horse.images[0]?.image_url}
              title={horse.name}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default FarmResidents
