import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import type { Horse } from '../api/horse'
import { BookVisitButton } from '../../booking'
import { SupportFarmButton } from '../../donation'

type HorseHeroProps = {
  horse: Horse
  /** Whether the horse can currently be booked (decides the CTA vs. the notice). */
  bookable: boolean
  /** Called when the visitor clicks "Book a Visit". */
  onBook: () => void
  /** Called when the visitor clicks "Support This Horse's Farm". */
  onSupport: () => void
  /** True when booking is blocked only by the logged-in account's type. */
  bookingRestrictedForAccount?: boolean
}

// Full-height hero for the public horse page: framed photo (with a blurred
// bleed behind it) on the left, and a details panel — name, meta line, sire ×
// dam, book CTA, and thumbnail carousel — on the right. Owns its own
// `activeImageIndex` since the selected photo is only relevant within here.
function HorseHero({ horse, bookable, onBook, onSupport, bookingRestrictedForAccount = false }: HorseHeroProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Color · date of birth · gender, skipping whichever fields are unset.
  const metaLine = [horse.color, horse.date_of_birth, horse.gender]
    .filter(Boolean)
    .join('  ·  ')

  return (
    <section className="grid lg:grid-cols-[1.4fr_1fr] min-h-[calc(100vh-3.25rem)]">
      <div className="relative bg-brand-bg flex items-center justify-center min-h-[45vh] lg:min-h-0 overflow-hidden p-6 lg:p-10">
        {/* Blurred, zoomed copy of the photo fills the space instead of black
            bars, so the empty area picks up the image's own colours. */}
        {horse.images.length > 0 && (
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl brightness-90"
            style={{
              backgroundImage: `url(${horse.images[activeImageIndex].image_url})`,
            }}
          />
        )}

        {/* Show the left side image of the horse */}
        {horse.images.length > 0 ? (
          <img
            key={horse.images[activeImageIndex].id}
            src={horse.images[activeImageIndex].image_url}
            alt={horse.name}
            className="relative z-1 w-full max-w-2xl aspect-4/3 object-cover rounded-lg border-4 border-white shadow-2xl"
            decoding="async"
          />
        ) : (
          <div className="relative z-1 w-full max-w-2xl aspect-4/3 rounded-lg border-4 border-dashed border-brand-border bg-brand-surface/40 flex flex-col items-center justify-center gap-4 text-center px-6">
            <ImageOff size={56} strokeWidth={1.25} className="text-brand-gold/70" />
            <p className="text-lg font-bold uppercase tracking-[0.2em] text-brand-text">
              No photos yet
            </p>
            <p className="text-sm text-brand-muted max-w-xs">
              No photos of {horse.name} have been added yet — check back soon.
            </p>
          </div>
        )}
      </div>

      {/* Details panel */}
      <div className="relative flex flex-col items-center justify-center text-center gap-7 bg-brand-gold text-white p-10 lg:p-16 overflow-hidden">
        {/* The photo bleeds in, heavily blurred, then fades into the panel. */}
        {horse.images.length > 0 && (
          <>
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center blur-3xl scale-150 brightness-50"
              style={{
                backgroundImage: `url(${horse.images[activeImageIndex].image_url})`,
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-b from-brand-gold/40 via-brand-gold/70 to-brand-gold"
            />
          </>
        )}

        {/* Horse name and meta line */}
        <div className="relative z-1 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-wide uppercase leading-none">
              <span className="text-amber-300">{horse.name.charAt(0)}</span>
              {horse.name.slice(1)}
            </h1>
            <span className="block w-14 h-px bg-white/40" />
            {metaLine && (
              <p className="text-xs lg:text-sm uppercase tracking-[0.2em] text-white/75">
                {metaLine}
              </p>
            )}
          </div>

          {/* Sire × Dam */}
          <div className="text-lg lg:text-xl leading-relaxed">
            <p className="font-semibold">{horse.sire || '—'}</p>
            <p className="text-white/50 text-base my-1">×</p>
            <p className="font-semibold">{horse.dam || '—'}</p>
            {horse.dams_sire && (
              <p className="text-white/60 text-sm mt-1">(by {horse.dams_sire})</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <BookVisitButton
              bookable={bookable}
              onBook={onBook}
              variant="onGold"
              restrictedForAccount={bookingRestrictedForAccount}
            />
            {horse.farm_id !== null && (
              <SupportFarmButton onSupport={onSupport} variant="onGold" />
            )}
          </div>

          {/* Image carousel — click a thumbnail to change the main photo. */}
          {horse.images.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 max-w-xl">
              {horse.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`flex-none w-40 h-28 rounded-md overflow-hidden border-2 transition ${
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
    </section>
  )
}

export default HorseHero
