import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getHorsePublic, type Horse } from '../api/horse'
import { getHorseVisitSlots } from '../api/availability'
import HorseHero from '../components/HorseHero'
import HorseStory from '../components/HorseStory'
import HorsePedigree from '../components/HorsePedigree'
import HorseRaceRecords from '../components/HorseRaceRecords'
import BookVisitButton from '../components/BookVisitButton'

function HorseProfilePage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [horse, setHorse] = useState<Horse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load the public horse whenever the id changes.
  useEffect(() => {
    if (!id) return
    getHorsePublic(Number(id))
      .then(setHorse)
      .catch(() => setError('Horse not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading)
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">
        Loading...
      </div>
    )

  if (error || !horse)
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-red-600">
        {error ?? 'Horse not found'}
      </div>
    )

  // Bookable when the farm has visit availability configured and this horse has slots.
  const farmAvail = horse.farm_availability
  const bookable =
    farmAvail.enabled &&
    farmAvail.weekdays.length > 0 &&
    getHorseVisitSlots(farmAvail, horse.periods).length > 0

  return (
    <div className="bg-brand-bg text-brand-text overflow-x-hidden">
      
      {/* Pinned back button — stays in the viewport while scrolling the whole page. */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-2 z-40 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero: sharp framed photo on the left (shown at natural size so it never
          upscales), details panel on the right. */}
      <HorseHero
        horse={horse}
        bookable={bookable}
        onBook={() => navigate(`/book/${horse.id}`)}
      />

      {/* Everything below the hero */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex flex-col gap-6">
          <HorseStory story={horse.story} />

          <HorsePedigree horse={horse} />

          <HorseRaceRecords records={horse.race_records} />

          <div className="flex justify-center py-4">
            <BookVisitButton
              bookable={bookable}
              onBook={() => navigate(`/book/${horse.id}`)}
              variant="onLight"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HorseProfilePage
