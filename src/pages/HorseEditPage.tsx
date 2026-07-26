import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Eye } from 'lucide-react'
import { getHorse, type Horse } from '../api/horse'
import { useHorseImages } from '../hooks/useHorseImages'
import HorseImageManager from '../components/HorseImageManager'
import { useHorseInfoForm } from '../hooks/useHorseInfoForm'
import HorseInfoEditor from '../components/HorseInfoEditor'
import { useHorseRaceRecords } from '../hooks/useHorseRaceRecords'
import HorseRaceRecordsEditor from '../components/HorseRaceRecordsEditor'

function HorseEditPage() {

  // Horse id from the URL; navigation for the back button and preview link.
  const { id } = useParams()
  const navigate = useNavigate()

  // Shared horse data + load state. Each section's own state lives in its hook.
  const [horse, setHorse] = useState<Horse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Image state + upload/delete/reorder logic (see useHorseImages).
  const images = useHorseImages(horse, setHorse)

  // Basic info / story / pedigree edit state + save logic (see useHorseInfoForm).
  const info = useHorseInfoForm(horse, setHorse)

  // Race-record edit state + CRUD logic (see useHorseRaceRecords).
  const races = useHorseRaceRecords(horse, setHorse)

  // Load the owner-only horse whenever the id changes.
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token || !id) return
    getHorse(token, Number(id))
      .then(setHorse)
      .catch(() => setLoadError('Horse not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">Loading...</div>
  if (!horse) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-red-600">{loadError ?? 'Horse not found'}</div>

  // Only one section may be edited at a time, and nothing while an image action runs.
  const imageActionsLocked = info.isEditing || races.isEditingRaces || images.busy
  const imageBusy = images.busy

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-8 py-10 max-w-4xl mx-auto">
      
      {/* Back button to navigate to the previous page in the browser history. */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-bold mb-8 transition"
      >
        <ArrowLeft size={16} /> Back to Horse Management
      </button>

      {/* Header section displaying the horse's name and a link to preview the public page for the horse. */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-gold">{horse.name}</h1>
        <Link
          to={`/horses/${horse.id}`}
          className="flex items-center gap-2 text-xs font-bold bg-brand-gold text-brand-bg px-4 py-2 rounded-lg hover:bg-brand-gold-light transition whitespace-nowrap"
          title="See the public visitor page (use Back to return)"
        >
          <Eye size={14} /> Preview public page
        </Link>
      </div>

      <div className="flex flex-col gap-6">

        {/* Image upload and management section */}
        <HorseImageManager horse={horse} images={images} locked={imageActionsLocked} />

        {/* Basic Info + Story + Pedigree */}
        <HorseInfoEditor horse={horse} info={info} locked={imageActionsLocked} imageBusy={imageBusy} />

        {/* Race records */}
        <HorseRaceRecordsEditor horse={horse} races={races} locked={imageActionsLocked} imageBusy={imageBusy} />
      </div>
    </div>
  )
}

export default HorseEditPage
