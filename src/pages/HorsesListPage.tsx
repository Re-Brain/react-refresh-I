import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getAllHorses, type Horse } from '../api/horse'
import OverlayCard from '../components/OverlayCard'

function HorsesListPage() {

  // State for horses, error handling, and loading state
  const [horses, setHorses] = useState<Horse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch horses data when the component mounts
  useEffect(() => {
    getAllHorses()
      .then(setHorses)
      .catch(() => setError('Failed to load horses. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-[calc(100vh-3.25rem)] bg-brand-bg text-brand-text">
      <div className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Back link to the home page */}
        <Link
          to="/"
          className="flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-bold mb-8 transition w-fit"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        {/* Page title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-gold mb-8">
          Champions in Retirement
        </h1>

        {/* Show loading state when horses are being fetched */}
        {loading && <p className="text-brand-muted text-sm">Loading...</p>}

        {/* Show error message if there was an error fetching horses */}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Show message if there are no horses */}
        {!loading && !error && horses.length === 0 && (
          <p className="text-brand-muted text-sm">No horses listed yet.</p>
        )}

        {/* Show grid of horses if there are any */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {horses.map(horse => (
            <OverlayCard
              key={horse.id}
              to={`/horses/${horse.id}`}
              imageUrl={horse.images[0]?.image_url}
              title={horse.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HorsesListPage
