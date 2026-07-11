import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getActiveFarms, type ActiveFarm } from '../api/farm'
import OverlayCard from '../components/OverlayCard'

function FarmsListPage() {
  const [farms, setFarms] = useState<ActiveFarm[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveFarms()
      .then(setFarms)
      .catch(() => setError('Failed to load farms. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-[calc(100vh-3.25rem)] bg-brand-bg text-brand-text">
      <div className="max-w-7xl mx-auto px-8 py-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-bold mb-8 transition w-fit"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-gold mb-8">
          Farms Open to Visitors
        </h1>

        {loading && <p className="text-brand-muted text-sm">Loading...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!loading && !error && farms.length === 0 && (
          <p className="text-brand-muted text-sm">No active farms yet.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {farms.map(farm => (
            <OverlayCard
              key={farm.id}
              to={`/farms/${farm.id}`}
              imageUrl={farm.images?.[0]?.image_url}
              title={farm.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FarmsListPage
