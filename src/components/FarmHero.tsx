import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, ImageOff } from 'lucide-react'
import type { ActiveFarm } from '../api/farm'

type FarmHeroProps = {
  farm: ActiveFarm
}

// Full-height farm hero: a gold details panel (name, location, photo thumbnails)
// on the left and a framed photo — on a blurred backdrop — on the right, or an
// empty state when the farm has no photos. Owns its own selected-photo index.
function FarmHero({ farm }: FarmHeroProps) {
  const navigate = useNavigate()
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const farmImages = farm.images ?? []
  const hasImages = farmImages.length > 0
  // Selected photo, or '' when the farm has none (an empty state is shown instead).
  const farmImage = farmImages[activeImageIndex]?.image_url ?? ''

  return (
    <section className="relative grid lg:grid-cols-[1fr_1.4fr] min-h-[calc(100vh-3.25rem)]">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-2 z-40 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Left: details panel */}
      <div className="relative order-2 lg:order-1 flex flex-col items-center justify-center text-center gap-7 bg-brand-gold text-white p-10 lg:p-16 overflow-hidden">
        {hasImages && (
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center blur-3xl scale-150 brightness-50"
            style={{ backgroundImage: `url(${farmImage})` }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-brand-gold/40 via-brand-gold/70 to-brand-gold"
        />

        <div className="relative z-1 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-wide uppercase leading-none">
              <span className="text-amber-300">{farm.name.charAt(0)}</span>
              {farm.name.slice(1)}
            </h1>
            <span className="block w-14 h-px bg-white/40" />
            <p className="flex flex-col items-center gap-2 text-sm lg:text-base uppercase tracking-[0.2em] text-white/80">
              <MapPin size={20} />
              {farm.location ?? 'Location not specified'}
            </p>
          </div>

          {/* Photo gallery — click a thumbnail to change the main photo. */}
          {farmImages.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 max-w-xl mt-2">
              {farmImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(i)}
                  aria-label={`View photo ${i + 1}`}
                  className={`flex-none w-32 h-24 rounded-md overflow-hidden border-2 transition ${
                    i === activeImageIndex
                      ? 'border-white'
                      : 'border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: framed photo on a blurred backdrop, or an empty state
          when the farm hasn't shared any photos yet. */}
      <div className="relative order-1 lg:order-2 bg-brand-bg flex items-center justify-center min-h-[45vh] lg:min-h-0 overflow-hidden p-6 lg:p-10">
        {hasImages ? (
          <>
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl brightness-90"
              style={{ backgroundImage: `url(${farmImage})` }}
            />
            <img
              src={farmImage}
              alt={farm.name}
              className="relative z-1 w-full max-w-2xl aspect-4/3 object-cover rounded-lg border-4 border-white shadow-2xl"
              loading="lazy"
              decoding="async"
            />
          </>
        ) : (
          <div className="relative z-1 w-full max-w-2xl aspect-4/3 rounded-lg border-4 border-dashed border-brand-border bg-brand-surface/40 flex flex-col items-center justify-center gap-4 text-center px-6">
            <ImageOff size={56} strokeWidth={1.25} className="text-brand-gold/70" />
            <p className="text-lg font-bold uppercase tracking-[0.2em] text-brand-text">
              No photos yet
            </p>
            <p className="text-sm text-brand-muted max-w-xs">
              {farm.name} hasn't shared any photos of the farm yet — check back soon.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default FarmHero
