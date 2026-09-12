import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Check, X, FileText, ExternalLink, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../auth'
import { FARM_DOCUMENT_TYPES, missingFarmDocumentTypes, FARM_STATUS_STYLES, FARM_STATUS_LABELS } from '../../farm'
import { getAdminFarm, updateFarmApproval, type AdminFarm } from '../api'

// Mirrors AdminHorseDetailPage: full read view of a single farm registration
// (images, profile, documents) plus the same approve/reject actions as the
// approvals table, for when the table's summary row isn't enough context.
function AdminFarmDetailPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const [farm, setFarm] = useState<AdminFarm | null>(null)
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
    if (!id) return
    getAdminFarm(Number(id))
      .then(setFarm)
      .catch(() => setLoadError('Farm not found'))
      .finally(() => setLoading(false))
  }, [id])

  async function act(status: 'active' | 'rejected', withReason?: string) {
    if (!farm) return
    setBusy(true)
    setActionError(null)
    try {
      await updateFarmApproval(farm.id, status, withReason)
      navigate('/admin')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update the farm.')
    } finally {
      setBusy(false)
    }
  }

  if (!user || user.role !== 'admin') return null
  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">Loading...</div>
  if (!farm) return <div className="min-h-screen bg-brand-bg flex items-center justify-center text-red-600">{loadError ?? 'Farm not found'}</div>

  const missing = missingFarmDocumentTypes(farm.documents)
  const imageCount = farm.images.length
  const safeImageIndex = Math.min(activeImageIndex, Math.max(0, imageCount - 1))
  const activeImage = farm.images[safeImageIndex]

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text px-4 xs:px-6 sm:px-8 py-10 max-w-4xl mx-auto">
      <Link
        to="/admin"
        className="flex items-center gap-2 text-brand-muted hover:text-brand-gold text-sm font-bold mb-8 transition"
      >
        <ArrowLeft size={16} /> Back to Farm Approvals
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-brand-gold">{farm.name}</h1>
            <span
              className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${FARM_STATUS_STYLES[farm.status]}`}
            >
              {FARM_STATUS_LABELS[farm.status]}
            </span>
          </div>
          <p className="text-brand-muted text-sm mt-1">{farm.location ?? 'No location set'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => act('active')}
            disabled={busy || missing.length > 0}
            title={missing.length > 0 ? `Missing: ${missing.map(m => FARM_DOCUMENT_TYPES.find(t => t.key === m)?.label).join(', ')}` : undefined}
            className="flex items-center gap-2 bg-green-600 text-white font-bold px-4 xs:px-5 py-2.5 rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={16} /> Approve
          </button>
          <button
            onClick={() => {
              setShowRejectPrompt(true)
              setReason('')
            }}
            disabled={busy}
            className="flex items-center gap-2 bg-red-600 text-white font-bold px-4 xs:px-5 py-2.5 rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-brand-surface border border-brand-border rounded-lg p-4 xs:p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">
            Photos <span className="normal-case font-normal">({farm.images.length}/3)</span>
          </p>
          {farm.images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 h-48 xs:h-56 sm:h-72 rounded-xl border border-dashed border-brand-border text-brand-muted text-sm">
              <ImageOff size={24} />
              No images uploaded
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden h-56 xs:h-72 sm:h-96 bg-brand-bg shadow-inner">
              <img
                key={activeImage.id}
                src={activeImage.image_url}
                alt={farm.name}
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
                    {farm.images.map((img, i) => (
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

        {/* Basic Info */}
        <div className="bg-brand-surface border border-brand-border rounded-lg p-4 xs:p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Basic Info</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-brand-muted">Location</span>
              <span className="text-brand-text font-bold">{farm.location || '—'}</span>
            </div>
          </div>

          <p className="text-xs font-bold text-brand-muted uppercase mt-2 pt-4 border-t border-brand-border">Description</p>
          {farm.description ? (
            <p className="text-sm text-brand-text leading-relaxed whitespace-pre-wrap">{farm.description}</p>
          ) : (
            <p className="text-sm text-brand-muted italic">No description yet.</p>
          )}

          {farm.status === 'rejected' && farm.rejection_reason && (
            <>
              <p className="text-xs font-bold text-brand-muted uppercase mt-2 pt-4 border-t border-brand-border">
                Rejection Reason
              </p>
              <p className="text-sm text-red-600 leading-relaxed whitespace-pre-wrap">{farm.rejection_reason}</p>
            </>
          )}
        </div>

        {/* Proof Documents */}
        <div className="bg-brand-surface border border-brand-border rounded-lg p-4 xs:p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-brand-muted uppercase">Proof Documents</p>
          <div className="flex flex-col gap-3">
            {FARM_DOCUMENT_TYPES.map(({ key, label }) => {
              const doc = farm.documents?.find(d => d.document_type === key)
              return (
                <div
                  key={key}
                  className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 bg-brand-bg border border-brand-border rounded-lg px-4 py-3"
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
            className="bg-brand-surface border border-brand-border rounded-xl p-4 xs:p-6 w-full max-w-md flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-lg font-bold text-brand-text">Reject {farm.name}&rsquo;s registration?</h3>
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

export default AdminFarmDetailPage
