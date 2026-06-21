import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllHorses, type Horse } from '../api/horse'

function HorseCard({ horse }: { horse: Horse }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/horses/${horse.id}`)}
      className="bg-brand-surface border border-brand-border rounded-lg p-5 flex flex-col gap-3 cursor-pointer hover:border-brand-gold transition"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-brand-gold font-bold text-lg">{horse.name}</h3>
        <span className="text-xs text-brand-muted capitalize">{horse.gender ?? '—'}</span>
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <span className="text-brand-muted">Breed</span>
          <span className="text-brand-text font-bold">{horse.breed ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-muted">Age</span>
          <span className="text-brand-text font-bold">{horse.age ? `${horse.age} years` : '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-muted">Sire</span>
          <span className="text-brand-text font-bold">{horse.sire ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-muted">Dam</span>
          <span className="text-brand-text font-bold">{horse.dam ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}

function HomePage() {
  const [horses, setHorses] = useState<Horse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAllHorses()
      .then(setHorses)
      .catch(() => setError('Failed to load horses'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-gold mb-2">Horses</h1>
        <p className="text-brand-muted text-sm mb-8">Browse all available horses</p>

        {loading && <p className="text-brand-muted text-sm">Loading...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && !error && horses.length === 0 && (
          <p className="text-brand-muted text-sm">No horses listed yet.</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {horses.map(horse => (
            <HorseCard key={horse.id} horse={horse} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
