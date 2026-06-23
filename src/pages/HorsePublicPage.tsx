import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { getHorsePublic, type Horse, type RaceRecord } from '../api/horse'

const GRADE_COLORS: Record<string, string> = {
  G1: 'bg-red-500',
  G2: 'bg-blue-500',
  G3: 'bg-green-600',
}

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return null
  const color = GRADE_COLORS[grade] ?? 'bg-brand-muted'
  return (
    <span className={`${color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1`}>
      {grade}
    </span>
  )
}

function FinishPos({ pos }: { pos: number }) {
  const color = pos === 1 ? 'text-brand-gold font-bold' : pos === 2 ? 'text-slate-300 font-bold' : pos === 3 ? 'text-amber-600 font-bold' : 'text-brand-muted'
  return <span className={color}>{pos}</span>
}

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
          <p className="text-xs font-bold text-brand-muted uppercase">Profile</p>
          <div className="grid grid-cols-2 gap-4">
            {([['Name', horse.name], ['Color', horse.color], ['Date of Birth', horse.date_of_birth], ['Gender', horse.gender]] as const).map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-xs text-brand-muted">{label}</span>
                <span className="text-brand-text font-bold capitalize">{value ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Pedigree</p>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr>
                <td rowSpan={2} className="border border-brand-border bg-blue-500/10 text-center font-bold text-blue-300 px-3 w-16 align-middle">
                  Sire
                </td>
                <td rowSpan={2} className="border border-brand-border px-4 py-3 font-bold text-brand-text align-middle w-1/3">
                  {horse.sire || '—'}
                </td>
                <td className="border border-brand-border px-4 py-2 text-brand-muted">
                  {horse.sires_sire || '—'}
                </td>
              </tr>
              <tr>
                <td className="border border-brand-border px-4 py-2 text-brand-muted">
                  {horse.sires_dam || '—'}
                </td>
              </tr>
              <tr>
                <td rowSpan={2} className="border border-brand-border bg-rose-500/10 text-center font-bold text-rose-300 px-3 w-16 align-middle">
                  Dam
                </td>
                <td rowSpan={2} className="border border-brand-border px-4 py-3 font-bold text-brand-text align-middle w-1/3">
                  {horse.dam || '—'}
                </td>
                <td className="border border-brand-border px-4 py-2 text-brand-muted">
                  {horse.dams_sire || '—'}
                </td>
              </tr>
              <tr>
                <td className="border border-brand-border px-4 py-2 text-brand-muted">
                  {horse.dams_dam || '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {horse.race_records.length > 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
            <p className="text-xs font-bold text-brand-muted uppercase">Race Record</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted text-xs uppercase">
                    <th className="text-left px-3 py-2 font-bold">Date</th>
                    <th className="text-left px-3 py-2 font-bold">Course</th>
                    <th className="text-left px-3 py-2 font-bold">Race</th>
                    <th className="text-center px-3 py-2 font-bold">FP</th>
                    <th className="text-left px-3 py-2 font-bold">Track</th>
                    <th className="text-left px-3 py-2 font-bold">Dist.</th>
                    <th className="text-left px-3 py-2 font-bold">Cond.</th>
                  </tr>
                </thead>
                <tbody>
                  {horse.race_records.map((r: RaceRecord) => (
                    <tr key={r.id} className="border-b border-brand-border hover:bg-brand-bg/40 transition">
                      <td className="px-3 py-2 text-brand-muted whitespace-nowrap">{r.race_date}</td>
                      <td className="px-3 py-2 text-brand-text">{r.course}</td>
                      <td className="px-3 py-2 text-brand-text whitespace-nowrap">
                        {r.race_name}
                        <GradeBadge grade={r.grade} />
                      </td>
                      <td className="px-3 py-2 text-center"><FinishPos pos={r.finish_position} /></td>
                      <td className="px-3 py-2 text-brand-muted">{r.track}</td>
                      <td className="px-3 py-2 text-brand-muted">{r.distance}M</td>
                      <td className="px-3 py-2 text-brand-muted">{r.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HorsePublicPage
