import { useState, useEffect } from 'react'
import { getActiveFarms, type ActiveFarm } from '../api/farm'
import { getAllHorses, type Horse } from '../api/horse'
import OverlayCard from '../components/OverlayCard'
import Carousel from '../components/Carousel'

function HomePage() {
  const [farms, setFarms] = useState<ActiveFarm[]>([])
  const [farmsError, setFarmsError] = useState<string | null>(null)
  const [horses, setHorses] = useState<Horse[]>([])
  const [horsesError, setHorsesError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getActiveFarms()
        .then(setFarms)
        .catch(() => setFarmsError('Failed to load farms. Please try again later.')),
      getAllHorses()
        .then(setHorses)
        .catch(() => setHorsesError('Failed to load horses. Please try again later.')),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-brand-bg text-brand-text">
      {/* Hero — fills the viewport below the navbar */}
      <section className="relative min-h-[calc(100vh-3.25rem)] flex items-center justify-center overflow-hidden">
        <img
          src="https://picsum.photos/seed/horse-hero/1920/1080"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Racing-green wash so the text stays readable while keeping a sunny, pastoral feel */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0f2a1f]/85 via-[#1f4d3a]/45 to-[#1f4d3a]/25" />
        <div className="relative z-10 px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg max-w-4xl mx-auto">
            Top Horse Retirement Visit Booking System
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-white/90 drop-shadow">
            Meet retired racehorses. Book your farm visit today.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-gold mb-8">Farms Open to Visitors</h1>

        {loading && <p className="text-brand-muted text-sm">Loading...</p>}
        {farmsError && <p className="text-red-600 text-sm">{farmsError}</p>}
        {!loading && !farmsError && farms.length === 0 && (
          <p className="text-brand-muted text-sm">No active farms yet.</p>
        )}
        <Carousel>
          {farms.map(farm => (
            <div key={farm.id} className="flex-none w-40 sm:w-48">
              <OverlayCard
                to={`/farms/${farm.id}`}
                imageUrl={`https://picsum.photos/seed/farm-${farm.id}/600/600`}
                title={farm.name}
              />
            </div>
          ))}
        </Carousel>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-gold mb-8 mt-12 text-right">Champions in Retirement</h1>

        {horsesError && <p className="text-red-600 text-sm">{horsesError}</p>}
        {!loading && !horsesError && horses.length === 0 && (
          <p className="text-brand-muted text-sm">No horses listed yet.</p>
        )}
        <Carousel direction="right">
          {horses.map(horse => (
            <div key={horse.id} className="flex-none w-40 sm:w-48">
              <OverlayCard
                to={`/horses/${horse.id}`}
                imageUrl={
                  horse.images[0]?.image_url ??
                  `https://picsum.photos/seed/horse-${horse.id}/600/600`
                }
                title={horse.name}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  )
}

export default HomePage
