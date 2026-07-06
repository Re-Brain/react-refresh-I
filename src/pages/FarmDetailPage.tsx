import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getFarm, type ActiveFarm } from '../api/farm'
import { getAllHorses, type Horse } from '../api/horse'
import OverlayCard from '../components/OverlayCard'

type LoadState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' }
  | { status: 'ready'; farm: ActiveFarm }

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-brand-border py-3">
      <span className="text-xs uppercase tracking-wide text-brand-muted">{label}</span>
      <span className="text-brand-text">{value}</span>
    </div>
  )
}

function FarmDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [horses, setHorses] = useState<Horse[]>([])
  const [horsesError, setHorsesError] = useState(false)

  useEffect(() => {
    getFarm(id!)
      .then(farm =>
        setState(farm ? { status: 'ready', farm } : { status: 'notFound' }),
      )
      .catch(() => setState({ status: 'error' }))

    // The backend has no "horses by farm" route, so fetch all and filter by farm_id.
    getAllHorses()
      .then(all => setHorses(all.filter(h => h.farm_id === Number(id))))
      .catch(() => setHorsesError(true))
  }, [id])

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-sm text-brand-muted hover:text-brand-gold transition">
          ← Back to farms
        </Link>

        {state.status === 'loading' && (
          <p className="text-brand-muted text-sm mt-8">Loading...</p>
        )}

        {state.status === 'error' && (
          <p className="text-red-400 text-sm mt-8">
            Failed to load this farm. Please try again later.
          </p>
        )}

        {state.status === 'notFound' && (
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-brand-gold mb-2">Farm not found</h1>
            <p className="text-brand-muted text-sm">
              We couldn't find a farm with that ID.
            </p>
          </div>
        )}

        {state.status === 'ready' && (
          <div className="mt-6">
            <h1 className="text-3xl font-bold text-brand-gold mb-6">{state.farm.name}</h1>

            <div className="w-full aspect-video bg-brand-bg rounded-md overflow-hidden mb-6">
              <img
                src={`https://picsum.photos/seed/farm-${state.farm.id}/800/450`}
                alt={state.farm.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <DetailRow
              label="Location"
              value={state.farm.location ?? 'Location not specified'}
            />
            <DetailRow
              label="Description"
              value={state.farm.description ?? 'No description provided.'}
            />

            <section className="mt-8">
              <h2 className="text-xl font-bold text-brand-gold mb-4">Horses</h2>

              {horsesError ? (
                <p className="text-red-400 text-sm">Failed to load horses.</p>
              ) : horses.length === 0 ? (
                <p className="text-brand-muted text-sm">
                  No horses listed for this farm yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmDetailPage
