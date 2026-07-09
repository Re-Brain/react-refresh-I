import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { getFarm, type ActiveFarm } from '../api/farm'
import { getAllHorses, type Horse } from '../api/horse'
import OverlayCard from '../components/OverlayCard'

type LoadState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' }
  | { status: 'ready'; farm: ActiveFarm }

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

  const farmImage =
    state.status === 'ready'
      ? `https://picsum.photos/seed/farm-${state.farm.id}/1200/900`
      : ''

  return (
    <div className="bg-brand-bg text-brand-text">
      {state.status === 'loading' && (
        <div className="min-h-[calc(100vh-3.25rem)] flex items-center justify-center text-brand-muted text-sm">
          Loading...
        </div>
      )}

      {state.status === 'error' && (
        <div className="min-h-[calc(100vh-3.25rem)] flex flex-col items-center justify-center gap-4">
          <p className="text-red-600 text-sm">
            Failed to load this farm. Please try again later.
          </p>
          <Link to="/" className="text-sm text-brand-muted hover:text-brand-gold transition">
            ← Back
          </Link>
        </div>
      )}

      {state.status === 'notFound' && (
        <div className="min-h-[calc(100vh-3.25rem)] flex flex-col items-center justify-center gap-2">
          <h1 className="text-3xl font-bold text-brand-gold">Farm not found</h1>
          <p className="text-brand-muted text-sm">
            We couldn't find a farm with that ID.
          </p>
          <Link to="/" className="text-sm text-brand-muted hover:text-brand-gold transition mt-2">
            ← Back
          </Link>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          {/* Hero: farm name + location panel on the left, framed photo on the right */}
          <section className="relative grid lg:grid-cols-[1fr_1.4fr] min-h-[calc(100vh-3.25rem)]">
            <Link
              to="/"
              className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition"
            >
              <ArrowLeft size={16} /> Back
            </Link>

            {/* Left: details panel */}
            <div className="relative order-2 lg:order-1 flex flex-col items-center justify-center text-center gap-7 bg-brand-gold text-white p-10 lg:p-16 overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center blur-3xl scale-150 brightness-50"
                style={{ backgroundImage: `url(${farmImage})` }}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-b from-brand-gold/40 via-brand-gold/70 to-brand-gold"
              />

              <div className="relative z-1 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-4">
                  <h1 className="text-4xl lg:text-6xl font-extrabold tracking-wide uppercase leading-none">
                    <span className="text-amber-300">{state.farm.name.charAt(0)}</span>
                    {state.farm.name.slice(1)}
                  </h1>
                  <span className="block w-14 h-px bg-white/40" />
                  <p className="flex flex-col items-center gap-2 text-sm lg:text-base uppercase tracking-[0.2em] text-white/80">
                    <MapPin size={20} />
                    {state.farm.location ?? 'Location not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: framed photo on a blurred backdrop */}
            <div className="relative order-1 lg:order-2 bg-brand-bg flex items-center justify-center min-h-[45vh] lg:min-h-0 overflow-hidden p-6 lg:p-10">
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl brightness-90"
                style={{ backgroundImage: `url(${farmImage})` }}
              />
              <img
                src={farmImage}
                alt={state.farm.name}
                className="relative z-1 w-full max-w-2xl aspect-4/3 object-cover rounded-lg border-4 border-white shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </div>
          </section>

          {/* About + Horses */}
          <div className="max-w-6xl mx-auto px-8 py-10 flex flex-col gap-12">
            {state.farm.description && (
              <section className="flex flex-col gap-6">
                <h2 className="text-2xl lg:text-3xl font-extrabold tracking-wide text-brand-gold text-center uppercase">
                  Our Story
                </h2>
                <p className="text-brand-text/90 leading-relaxed max-w-3xl mx-auto text-center">
                  {state.farm.description}
                </p>
              </section>
            )}

            <section className="flex flex-col gap-6">
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-wide text-brand-gold text-center uppercase">
                Our Residents
              </h2>

              {horsesError ? (
                <p className="text-red-600 text-sm text-center">Failed to load horses.</p>
              ) : horses.length === 0 ? (
                <p className="text-brand-muted text-sm text-center">
                  No horses listed for this farm yet.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
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
        </>
      )}
    </div>
  )
}

export default FarmDetailPage
