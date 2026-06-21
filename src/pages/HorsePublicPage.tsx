import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { getHorsePublic, type Horse } from '../api/horse'

const PEDIGREE_FIELDS: { key: keyof Horse; label: string }[] = [
  { key: 'sire', label: "Sire" },
  { key: 'dam', label: "Dam" },
  { key: 'sires_sire', label: "Sire's Sire" },
  { key: 'sires_dam', label: "Sire's Dam" },
  { key: 'dams_sire', label: "Dam's Sire" },
  { key: 'dams_dam', label: "Dam's Dam" },
]

function HorsePublicPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [horse, setHorse] = useState<Horse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (!id) return
    getHorsePublic(Number(id))
      .then(setHorse)
      .catch(() => setError('Horse not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">
      Loading...
    </div>
  )

  if (error || !horse) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center text-red-400">
      {error ?? 'Horse not found'}
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-8 py-10 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-bold mb-8 transition"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-3xl font-bold text-brand-gold mb-2">{horse.name}</h1>
      <p className="text-brand-muted text-sm mb-8 capitalize">
        {[horse.breed, horse.gender, horse.age ? `${horse.age} years old` : null]
          .filter(Boolean)
          .join(' · ')}
      </p>

      <div className="flex flex-col gap-6">

        {horse.images.length > 0 && (
          <div className="relative rounded-xl overflow-hidden h-96">
            <img
              key={horse.images[activeImageIndex].id}
              src={horse.images[activeImageIndex].image_url}
              alt={horse.name}
              className="w-full h-full object-contain"
              decoding="async"
            />

            {/* Prev / Next arrows */}
            {horse.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex(i => (i - 1 + horse.images.length) % horse.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActiveImageIndex(i => (i + 1) % horse.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition backdrop-blur-sm"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {horse.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {horse.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    aria-label={`Go to image ${i + 1}`}
                    className={`rounded-full transition-all duration-200 ${i === activeImageIndex ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Basic Info</p>
          <div className="grid grid-cols-2 gap-4">
            {([['Name', horse.name], ['Breed', horse.breed], ['Age', horse.age ? `${horse.age} years` : null], ['Gender', horse.gender]] as const).map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-xs text-brand-muted">{label}</span>
                <span className="text-brand-text font-bold capitalize">{value ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Pedigree</p>
          <div className="grid grid-cols-2 gap-4">
            {PEDIGREE_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-xs text-brand-muted">{label}</span>
                <span className="text-brand-text font-bold">{(horse[key] as string) ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HorsePublicPage
