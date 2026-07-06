import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getActiveFarms, type ActiveFarm } from '../api/farm'
import { getAllHorses, type Horse } from '../api/horse'

type OverlayCardProps = {
  to: string
  imageUrl: string
  title: string
}

function OverlayCard({ to, imageUrl, title }: OverlayCardProps) {
  return (
    <Link
      to={to}
      className="relative rounded-2xl overflow-hidden cursor-pointer bg-brand-bg ring-1 ring-brand-border hover:ring-2 hover:ring-brand-gold transition"
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-full aspect-square object-cover"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      <h3 className="absolute bottom-0 left-0 right-0 p-4 text-white font-bold text-2xl uppercase tracking-wide">
        {title}
      </h3>
    </Link>
  )
}

function HomePage() {
  const [farms, setFarms] = useState<ActiveFarm[]>([])
  const [farmsError, setFarmsError] = useState<string | null>(null)
  const [horses, setHorses] = useState<Horse[]>([])
  const [horsesError, setHorsesError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getActiveFarms()
        .then(setFarms)
        .catch(() => setFarmsError('Failed to load farms. Please try again later.')),
      getAllHorses()
        .then(setHorses)
        .catch(() => setHorsesError('Failed to load horses. Please try again later.')),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-gold mb-2">Farms</h1>
        <p className="text-brand-muted text-sm mb-8">Browse all active farms</p>

        {loading && <p className="text-brand-muted text-sm">Loading...</p>}
        {farmsError && <p className="text-red-400 text-sm">{farmsError}</p>}
        {!loading && !farmsError && farms.length === 0 && (
          <p className="text-brand-muted text-sm">No active farms yet.</p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {farms.map(farm => (
            <OverlayCard
              key={farm.id}
              to={`/farms/${farm.id}`}
              imageUrl={`https://picsum.photos/seed/farm-${farm.id}/600/600`}
              title={farm.name}
            />
          ))}
        </div>

        <h1 className="text-3xl font-bold text-brand-gold mb-2 mt-12">Horses</h1>
        <p className="text-brand-muted text-sm mb-8">Browse all available horses</p>

        {horsesError && <p className="text-red-400 text-sm">{horsesError}</p>}
        {!loading && !horsesError && horses.length === 0 && (
          <p className="text-brand-muted text-sm">No horses listed yet.</p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {horses.map(horse => (
            <OverlayCard
              key={horse.id}
              to={`/horses/${horse.id}`}
              imageUrl={
                horse.images[0]?.image_url ??
                `https://picsum.photos/seed/horse-${horse.id}/600/600`
              }
              title={horse.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
