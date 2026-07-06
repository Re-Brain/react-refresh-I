import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getActiveFarms, type ActiveFarm } from '../api/farm'

function FarmCard({ farm }: { farm: ActiveFarm }) {
  return (
    <Link
      to={`/farms/${farm.id}`}
      className="bg-brand-surface border border-brand-border rounded-lg overflow-hidden flex flex-col cursor-pointer hover:border-brand-gold transition"
    >
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-brand-gold font-bold text-xl">{farm.name}</h3>

        <div className="w-full aspect-video bg-brand-bg rounded-md overflow-hidden">
          <img
            src={`https://picsum.photos/seed/farm-${farm.id}/400/225`}
            alt={farm.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        <p className="text-sm text-brand-muted">
          {farm.location ?? 'Location not specified'}
        </p>

        <p className="text-sm text-brand-text">
          {farm.description ?? 'No description provided.'}
        </p>
      </div>
    </Link>
  )
}

function HomePage() {
  const [farms, setFarms] = useState<ActiveFarm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getActiveFarms()
      .then(setFarms)
      .catch(() => setError('Failed to load farms. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-gold mb-2">Farms</h1>
        <p className="text-brand-muted text-sm mb-8">Browse all active farms</p>

        {loading && <p className="text-brand-muted text-sm">Loading...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && !error && farms.length === 0 && (
          <p className="text-brand-muted text-sm">No active farms yet.</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map(farm => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
