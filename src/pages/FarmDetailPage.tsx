import { useParams, Link } from 'react-router-dom'
import { useFarmDetail } from '../hooks/useFarmDetail'
import FarmHero from '../components/FarmHero'
import FarmStory from '../components/FarmStory'
import FarmLocationMap from '../components/FarmLocationMap'
import FarmResidents from '../components/FarmResidents'

function FarmDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { state, horses, horsesError } = useFarmDetail(id)

  return (
    <div className="bg-brand-bg text-brand-text overflow-x-hidden">
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
          <FarmHero farm={state.farm} />

          {/* About + Horses */}
          <div className="max-w-6xl mx-auto px-8 py-10 flex flex-col gap-12">
            <FarmStory description={state.farm.description} />
            <FarmLocationMap farm={state.farm} />
            <FarmResidents horses={horses} horsesError={horsesError} />
          </div>
        </>
      )}
    </div>
  )
}

export default FarmDetailPage
