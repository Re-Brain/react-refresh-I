import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllHorses, type Horse } from '../api/horse'

function HorseCard({ horse }: { horse: Horse }) {
  const navigate = useNavigate()
  const firstImage = horse.images[0]

  return (
    <div
      onClick={() => navigate(`/horses/${horse.id}`)}
      className="bg-brand-surface border border-brand-border rounded-lg overflow-hidden flex flex-col cursor-pointer hover:border-brand-gold transition"
    >
      <div className="w-full aspect-video bg-brand-bg flex items-center justify-center overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage.image_url}
            alt={horse.name}
            className="w-full h-full object-contain"
            decoding="async"
          />
        ) : (
          <span className="text-brand-muted text-xs">No image</span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-brand-gold font-bold text-base">{horse.name}</h3>
          <span className="text-xs text-brand-muted capitalize">{horse.gender ?? '—'}</span>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-brand-muted">Color</span>
            <span className="text-brand-text font-bold">{horse.color ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Date of Birth</span>
            <span className="text-brand-text font-bold">{horse.date_of_birth ?? '—'}</span>
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
