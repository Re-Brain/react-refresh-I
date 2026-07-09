import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getHorsePublic, type Horse, type RaceRecord } from '../api/horse'

// Placeholder images (Picsum) are served at whatever size the URL requests.
// The full-page hero is large, so ask for a high-res version to keep it crisp
// on hi-DPI/retina screens. Real uploaded image URLs are returned unchanged.
function hiRes(url: string): string {
  return url.replace(
    /(picsum\.photos\/(?:seed\/[^/]+\/)?)\d+\/\d+/,
    '$11600/1600',
  )
}

const GRADE_COLORS: Record<string, string> = {
  G1: 'bg-red-500',
  G2: 'bg-blue-500',
  G3: 'bg-green-600',
}

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return null
  const color = GRADE_COLORS[grade] ?? 'bg-brand-muted'
  return (
    <span
      className={`${color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1`}
    >
      {grade}
    </span>
  )
}

function FinishPos({ pos }: { pos: number | null }) {
  if (pos == null) return <span className="text-brand-muted">—</span>
  const color =
    pos === 1
      ? 'text-amber-600 font-bold'
      : pos === 2
        ? 'text-slate-500 font-bold'
        : pos === 3
          ? 'text-orange-800 font-bold'
          : 'text-brand-muted'
  return <span className={color}>{pos}</span>
}

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

  const metaLine = [horse.color, horse.date_of_birth, horse.gender]
    .filter(Boolean)
    .join('  ·  ')

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
      <section className="grid lg:grid-cols-[1.4fr_1fr] min-h-[calc(100vh-3.25rem)]">
        <div className="relative bg-brand-bg flex items-center justify-center min-h-[45vh] lg:min-h-0 overflow-hidden p-6 lg:p-10">
          {/* Blurred, zoomed copy of the photo fills the space instead of black
              bars, so the empty area picks up the image's own colours. */}
          {horse.images.length > 0 && (
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl brightness-90"
              style={{
                backgroundImage: `url(${hiRes(horse.images[activeImageIndex].image_url)})`,
              }}
            />
          )}

          {horse.images.length > 0 ? (
            <img
              key={horse.images[activeImageIndex].id}
              src={hiRes(horse.images[activeImageIndex].image_url)}
              alt={horse.name}
              className="relative z-1 w-full max-w-2xl aspect-4/3 object-cover rounded-lg border-4 border-white shadow-2xl"
              decoding="async"
            />
          ) : (
            <div className="relative z-1 text-brand-muted text-sm">
              No image available
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
                  backgroundImage: `url(${hiRes(horse.images[activeImageIndex].image_url)})`,
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-b from-brand-gold/40 via-brand-gold/70 to-brand-gold"
              />
            </>
          )}

          <div className="relative z-1 flex flex-col items-center gap-7">
            <div className="flex flex-col items-center gap-4">
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

            <div className="text-lg lg:text-xl leading-relaxed">
              <p className="font-semibold">{horse.sire || '—'}</p>
              <p className="text-white/50 text-base my-1">×</p>
              <p className="font-semibold">{horse.dam || '—'}</p>
              {horse.dams_sire && (
                <p className="text-white/60 text-sm mt-1">(by {horse.dams_sire})</p>
              )}
            </div>

            <button
              type="button"
              className="mt-2 bg-white text-brand-gold text-sm font-bold uppercase tracking-[0.2em] px-12 py-3.5 rounded-full shadow-md hover:bg-brand-bg hover:scale-[1.03] transition"
            >
              Book a Visit
            </button>

            {/* Image carousel — click a thumbnail to change the main photo. */}
            {horse.images.length > 1 && (
              <div className="flex flex-wrap justify-center gap-3 max-w-xl mt-2">
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

      {/* Everything below the hero */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex flex-col gap-6">
          {horse.story && (
            <section className="flex flex-col gap-6 py-4">
              <h2
                style={{ fontFamily: 'var(--font-story-title)' }}
                className="text-3xl lg:text-4xl font-semibold tracking-wide text-brand-gold text-left"
              >
                Story
              </h2>
              <p
                style={{ fontFamily: 'var(--font-story-body)' }}
                className="text-brand-text text-2xl lg:text-3xl leading-relaxed whitespace-pre-wrap text-left first-letter:float-left first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-semibold first-letter:text-brand-gold first-letter:mr-3 first-letter:leading-none"
              >
                {horse.story}
              </p>
            </section>
          )}

          <section className="relative left-1/2 right-1/2 mx-[-50vw] w-screen bg-brand-gold py-20 lg:py-28">
            <div className="max-w-6xl mx-auto px-8 flex flex-col gap-6">
            <h2
              style={{ fontFamily: 'var(--font-story-title)' }}
              className="text-3xl lg:text-4xl font-semibold tracking-wide text-white text-right"
            >
              Pedigree
            </h2>
            <div className="overflow-x-auto rounded-xl border-4 border-brand-border shadow-xl">
              <table
                style={{ fontFamily: 'var(--font-story-body)' }}
                className="w-full border-collapse text-lg lg:text-xl bg-brand-surface"
              >
                <tbody>
                  {/* Sire side (top), Dam side (bottom). Parents span the left
                      column; grandparents sit in the right column. */}
                  <tr>
                    <td
                      rowSpan={2}
                      className="border border-brand-border px-5 py-4 font-bold text-brand-text align-middle w-1/2"
                    >
                      {horse.sire || '—'}
                    </td>
                    <td className="border border-brand-border px-5 py-4 text-brand-text">
                      {horse.sires_sire || '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-brand-border px-5 py-4 text-brand-text">
                      {horse.sires_dam || '—'}
                    </td>
                  </tr>
                  <tr>
                    <td
                      rowSpan={2}
                      className="border border-brand-border px-5 py-4 font-bold text-brand-text align-middle w-1/2"
                    >
                      {horse.dam || '—'}
                    </td>
                    <td className="border border-brand-border px-5 py-4 text-brand-text">
                      {horse.dams_sire || '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-brand-border px-5 py-4 text-brand-text">
                      {horse.dams_dam || '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            </div>
          </section>

          {horse.race_records.length > 0 && (
            <section className="flex flex-col gap-6 py-4">
              <h2
                style={{ fontFamily: 'var(--font-story-title)' }}
                className="text-3xl lg:text-4xl font-semibold tracking-wide text-brand-gold text-left"
              >
                Race Record
              </h2>
              <div className="bg-brand-surface border-4 border-brand-border rounded-xl shadow-xl p-6 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-muted text-xs uppercase">
                      <th className="text-left px-3 py-2 font-bold">Date</th>
                      <th className="text-left px-3 py-2 font-bold">Course</th>
                      <th className="text-left px-3 py-2 font-bold">Race</th>
                      <th className="text-left px-3 py-2 font-bold">FP</th>
                      <th className="text-left px-3 py-2 font-bold">Track</th>
                      <th className="text-left px-3 py-2 font-bold">Dist.</th>
                      <th className="text-left px-3 py-2 font-bold">Cond.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horse.race_records.map((r: RaceRecord) => (
                      <tr
                        key={r.id}
                        className="border-b border-brand-border hover:bg-brand-bg/40 transition"
                      >
                        <td className="px-3 py-2 text-brand-muted whitespace-nowrap">
                          {r.race_date}
                        </td>
                        <td className="px-3 py-2 text-brand-text">
                          {r.course}
                        </td>
                        <td className="px-3 py-2 text-brand-text whitespace-nowrap">
                          {r.race_name}
                          <GradeBadge grade={r.grade} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <FinishPos pos={r.finish_position} />
                        </td>
                        <td className="px-3 py-2 text-brand-muted">
                          {r.track}
                        </td>
                        <td className="px-3 py-2 text-brand-muted">
                          {r.distance}M
                        </td>
                        <td className="px-3 py-2 text-brand-muted">
                          {r.condition}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="flex justify-center py-4">
            <button
              type="button"
              className="bg-brand-gold text-white text-sm font-bold uppercase tracking-[0.2em] px-12 py-3.5 rounded-full shadow-md hover:bg-brand-gold-light hover:scale-[1.03] transition"
            >
              Book a Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HorsePublicPage
