import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Check, X, FileText, ExternalLink, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../auth'
import {
  getHorse,
  DOCUMENT_TYPES,
  type Horse,
  missingDocumentTypes,
  PEDIGREE_FIELDS,
  HORSE_STATUS_STYLES,
  HORSE_STATUS_LABELS,
  GradeBadge,
  FinishPos,
} from '../../farm'
import { updateHorseApproval } from '../api'

function AdminHorseDetailPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const [horse, setHorse] = useState<Horse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showRejectPrompt, setShowRejectPrompt] = useState(false)
  const [reason, setReason] = useState('')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token || !id) return
    getHorse(token, Number(id))
      .then(setHorse)
      .catch(() => setLoadError('Horse not found'))
      .finally(() => setLoading(false))
  }, [id])

  async function act(status: 'approved' | 'rejected', withReason?: string) {
    const token = localStorage.getItem('access_token')
    if (!token || !horse) return
    setBusy(true)
    setActionError(null)
    try {
      await updateHorseApproval(token, horse.id, status, withReason)
      navigate('/admin')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update the horse.')
    } finally {
      setBusy(false)
    }
  }

  if (!user || user.role !== 'admin') return null
  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">Loading...</div>
  if (!horse) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-red-600">{loadError ?? 'Horse not found'}</div>

  const missing = missingDocumentTypes(horse.documents)
  const filledPedigree = PEDIGREE_FIELDS.filter(({ key }) => horse[key]).length
  const imageCount = horse.images.length
  const safeImageIndex = Math.min(activeImageIndex, Math.max(0, imageCount - 1))
  const activeImage = horse.images[safeImageIndex]

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-8 py-10 max-w-4xl mx-auto">
      <Link
        to="/admin"
        className="flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-bold mb-8 transition"
      >
        <ArrowLeft size={16} /> Back to Horse Approvals
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-brand-gold">{horse.name}</h1>
            <span
              className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${HORSE_STATUS_STYLES[horse.status]}`}
            >
              {HORSE_STATUS_LABELS[horse.status]}
            </span>
          </div>
          <p className="text-brand-muted text-sm mt-1">{horse.farm_name ?? `Farm #${horse.farm_id}`}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => act('approved')}
            disabled={busy || missing.length > 0}
            title={missing.length > 0 ? `Missing: ${missing.map(m => DOCUMENT_TYPES.find(t => t.key === m)?.label).join(', ')}` : undefined}
            className="flex items-center gap-2 bg-green-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={16} /> Approve
          </button>
          <button
            onClick={() => {
              setShowRejectPrompt(true)
              setReason('')
            }}
            disabled={busy}
            className="flex items-center gap-2 bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} /> Reject
          </button>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm font-medium">
          <AlertTriangle size={18} className="shrink-0" />
          <p>{actionError}</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Images */}
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">
            Images <span className="normal-case font-normal">({horse.images.length}/3)</span>
          </p>
          {horse.images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 h-72 rounded-xl border border-dashed border-brand-border text-brand-muted text-sm">
              <ImageOff size={24} />
              No images uploaded
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden h-96 bg-brand-bg shadow-inner">
              <img
                key={activeImage.id}
                src={activeImage.image_url}
                alt={horse.name}
                className="w-full h-full object-contain"
                decoding="async"
              />

              <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {safeImageIndex + 1} / {imageCount}
              </span>

              {imageCount > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex(i => (i - 1 + imageCount) % imageCount)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(i => (i + 1) % imageCount)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {horse.images.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImageIndex(i)}
                        aria-label={`Go to image ${i + 1}`}
                        className={`rounded-full transition-all duration-200 ${i === safeImageIndex ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Basic Info + Story */}
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Basic Info</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {([['Color', horse.color], ['Gender', horse.gender], ['Date of Birth', horse.date_of_birth]] as const).map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-xs text-brand-muted">{label}</span>
                <span className="text-brand-text font-bold capitalize">{value || '—'}</span>
              </div>
            ))}
          </div>

          <p className="text-xs font-bold text-brand-muted uppercase mt-2 pt-4 border-t border-brand-border">Story</p>
          {horse.story ? (
            <p className="text-sm text-brand-text leading-relaxed whitespace-pre-wrap">{horse.story}</p>
          ) : (
            <p className="text-sm text-brand-muted italic">No story yet.</p>
          )}
        </div>

        {/* Pedigree */}
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">
            Pedigree <span className="normal-case font-normal">({filledPedigree}/{PEDIGREE_FIELDS.length} filled)</span>
          </p>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr>
                <td rowSpan={2} className="border border-brand-border bg-blue-500/10 text-center font-bold text-blue-700 px-3 w-16 align-middle">
                  Sire
                </td>
                <td rowSpan={2} className="border border-brand-border px-4 py-3 font-bold text-brand-text align-middle w-1/3">
                  {horse.sire || '—'}
                </td>
                <td className="border border-brand-border px-4 py-2 text-brand-muted">{horse.sires_sire || '—'}</td>
              </tr>
              <tr>
                <td className="border border-brand-border px-4 py-2 text-brand-muted">{horse.sires_dam || '—'}</td>
              </tr>
              <tr>
                <td rowSpan={2} className="border border-brand-border bg-rose-500/10 text-center font-bold text-rose-700 px-3 w-16 align-middle">
                  Dam
                </td>
                <td rowSpan={2} className="border border-brand-border px-4 py-3 font-bold text-brand-text align-middle w-1/3">
                  {horse.dam || '—'}
                </td>
                <td className="border border-brand-border px-4 py-2 text-brand-muted">{horse.dams_sire || '—'}</td>
              </tr>
              <tr>
                <td className="border border-brand-border px-4 py-2 text-brand-muted">{horse.dams_dam || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Race Records */}
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">
            Race Records <span className="normal-case font-normal">({horse.race_records.length})</span>
          </p>
          {horse.race_records.length === 0 ? (
            <p className="text-sm text-brand-muted">No race records added.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse uppercase">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted text-xs uppercase">
                    <th className="text-left px-3 py-2 font-bold">Date</th>
                    <th className="text-left px-3 py-2 font-bold">Course</th>
                    <th className="text-left px-3 py-2 font-bold">Race</th>
                    <th className="text-left px-3 py-2 font-bold">Grade</th>
                    <th className="text-center px-3 py-2 font-bold">FP</th>
                    <th className="text-left px-3 py-2 font-bold">Track</th>
                    <th className="text-left px-3 py-2 font-bold">Cond.</th>
                    <th className="text-left px-3 py-2 font-bold">Dist.</th>
                  </tr>
                </thead>
                <tbody>
                  {horse.race_records.map(r => (
                    <tr key={r.id} className="border-b border-brand-border last:border-0">
                      <td className="px-2 py-1.5 whitespace-nowrap"><span className="text-brand-muted">{r.race_date}</span></td>
                      <td className="px-2 py-1.5"><span className="text-brand-text">{r.course}</span></td>
                      <td className="px-2 py-1.5 whitespace-nowrap"><span className="text-brand-text">{r.race_name}</span></td>
                      <td className="px-2 py-1.5"><GradeBadge grade={r.grade || null} /></td>
                      <td className="px-2 py-1.5 text-center"><FinishPos pos={r.finish_position ?? null} /></td>
                      <td className="px-2 py-1.5"><span className="text-brand-muted">{r.track}</span></td>
                      <td className="px-2 py-1.5"><span className="text-brand-muted">{r.condition}</span></td>
                      <td className="px-2 py-1.5"><span className="text-brand-muted">{r.distance}M</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Proof Documents */}
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Proof Documents</p>
          <div className="flex flex-col gap-3">
            {DOCUMENT_TYPES.map(({ key, label }) => {
              const doc = horse.documents?.find(d => d.document_type === key)
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 bg-brand-bg border border-brand-border rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={16} className="text-brand-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-brand-text">{label}</p>
                      {doc ? (
                        <p className="text-xs text-brand-muted truncate">
                          {doc.original_filename} &middot; {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-xs text-brand-muted">Not uploaded</p>
                      )}
                    </div>
                  </div>
                  {doc ? (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-brand-muted hover:text-brand-gold px-3 py-1.5 rounded-lg border border-brand-border transition shrink-0"
                    >
                      <ExternalLink size={13} /> View
                    </a>
                  ) : (
                    <X size={16} className="text-brand-muted shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showRejectPrompt && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowRejectPrompt(false)}
        >
          <div
            className="bg-brand-surface border border-brand-border rounded-xl p-6 w-full max-w-md flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-lg font-bold text-brand-text">Reject {horse.name}&rsquo;s registration?</h3>
              <p className="text-brand-muted text-sm mt-1">
                The farmer will be notified with your reason, so let them know what needs fixing.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-muted uppercase">Reason</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Let them know why…"
                rows={3}
                autoFocus
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => act('rejected', reason.trim())}
                disabled={busy || !reason.trim()}
                className="flex-1 bg-red-600 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? 'Rejecting…' : 'Confirm reject'}
              </button>
              <button
                onClick={() => setShowRejectPrompt(false)}
                disabled={busy}
                className="flex-1 text-brand-muted hover:text-brand-text font-bold px-4 py-2.5 rounded-lg border border-brand-border transition text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminHorseDetailPage
