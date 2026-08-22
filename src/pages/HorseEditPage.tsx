import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, AlertTriangle, Info, Check, X } from 'lucide-react'
import { getHorse, DOCUMENT_TYPES, type Horse } from '../api/horse'
import { useHorseImages } from '../hooks/useHorseImages'
import HorseImageManager from '../components/HorseImageManager'
import { useHorseInfoForm } from '../hooks/useHorseInfoForm'
import HorseInfoEditor from '../components/HorseInfoEditor'
import { useHorseRaceRecords } from '../hooks/useHorseRaceRecords'
import HorseRaceRecordsEditor from '../components/HorseRaceRecordsEditor'
import { useHorseDocuments } from '../hooks/useHorseDocuments'
import HorseDocumentManager from '../components/HorseDocumentManager'
import { useHorseSubmit } from '../hooks/useHorseSubmit'
import { hasAllDocumentTypes, missingDocumentTypes } from '../lib/horseDocuments'
import { PEDIGREE_FIELDS } from '../hooks/useAddHorseForm'

type Step = 1 | 2 | 3

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: 'Horse Details' },
  { step: 2, label: 'Proof Documents' },
  { step: 3, label: 'Review & Submit' },
]

function HorseEditPage() {

  // Horse id from the URL; navigation for the back button and preview link.
  const { id } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)

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

  // Proof-document upload/delete state (see useHorseDocuments).
  const documents = useHorseDocuments(horse, setHorse)

  // Draft -> pending submission state (see useHorseSubmit).
  const submit = useHorseSubmit(horse, setHorse)

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

  // Only one section may be edited at a time, and nothing while an image or document action runs.
  const imageActionsLocked = info.isEditing || races.isEditingRaces || images.busy || documents.busy
  const imageBusy = images.busy
  // Every edit endpoint 409s while pending, so lock the whole page read-only.
  const readOnly = horse.status === 'pending'
  const sectionsLocked = imageActionsLocked || readOnly
  const missingDocs = missingDocumentTypes(horse.documents)

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
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-gold">{horse.name}</h1>
        {horse.status === 'approved' ? (
          <Link
            to={`/horses/${horse.id}`}
            className="flex items-center gap-2 text-xs font-bold bg-brand-gold text-brand-bg px-4 py-2 rounded-lg hover:bg-brand-gold-light transition whitespace-nowrap"
            title="See the public visitor page (use Back to return)"
          >
            <Eye size={14} /> Preview public page
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title="Only approved horses have a public page"
            className="flex items-center gap-2 text-xs font-bold bg-brand-gold/50 text-brand-bg px-4 py-2 rounded-lg whitespace-nowrap cursor-not-allowed opacity-60"
          >
            <Eye size={14} /> Preview public page
          </button>
        )}
      </div>

      {/* Status banners — always visible regardless of which step is showing. */}
      {horse.status === 'draft' && (
        <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/40 text-blue-500 rounded-lg px-4 py-3 mb-6 text-sm font-medium">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>This horse is a draft and won&rsquo;t be visible to visitors until it&rsquo;s submitted and approved. Finish it up and submit from step 3.</p>
        </div>
      )}

      {horse.status === 'pending' && (
        <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-lg px-4 py-3 mb-6 text-sm font-medium">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>This horse is pending admin review and won&rsquo;t be visible to visitors until it&rsquo;s approved.</p>
        </div>
      )}

      {horse.status === 'rejected' && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm font-medium">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">This horse was rejected.</p>
            {horse.rejection_reason && <p className="mt-0.5">{horse.rejection_reason}</p>}
            <p className="mt-0.5 font-normal">Fix the issue above, then resubmit from step 3.</p>
          </div>
        </div>
      )}

      {/* Step nav — jump directly to any section. Locked while a section is
          mid-edit so an unsaved edit can't be left stranded on a hidden step. */}
      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-brand-border">
        {STEPS.map(s => (
          <button
            key={s.step}
            type="button"
            onClick={() => setStep(s.step)}
            disabled={imageActionsLocked}
            title={imageActionsLocked ? 'Finish editing (Save or Cancel) before switching sections' : undefined}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition disabled:opacity-40 disabled:cursor-not-allowed ${
              step === s.step
                ? 'bg-brand-gold text-brand-bg border-brand-gold'
                : 'border-brand-border text-brand-muted hover:text-brand-gold hover:border-brand-gold'
            }`}
          >
            {s.step}. {s.label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <HorseImageManager horse={horse} images={images} locked={sectionsLocked} />
          <HorseInfoEditor horse={horse} info={info} locked={sectionsLocked} imageBusy={imageBusy} />
          <HorseRaceRecordsEditor horse={horse} races={races} locked={sectionsLocked} imageBusy={imageBusy} />
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <HorseDocumentManager horse={horse} documents={documents} locked={sectionsLocked} />
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-5">
            <div>
              <p className="text-xs font-bold text-brand-muted uppercase mb-2">Basic Info</p>
              <p className="text-lg font-bold text-brand-text">{horse.name}</p>
              <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-3 mt-1 text-sm text-brand-muted">
                <p>Color: <span className="text-brand-text">{horse.color || '—'}</span></p>
                <p>Gender: <span className="text-brand-text capitalize">{horse.gender || '—'}</span></p>
                <p>Date of birth: <span className="text-brand-text">{horse.date_of_birth || '—'}</span></p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-brand-muted uppercase mb-2">
                Pedigree <span className="normal-case font-normal">({PEDIGREE_FIELDS.filter(({ key }) => horse[key]).length}/{PEDIGREE_FIELDS.length} filled)</span>
              </p>
              <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 text-sm text-brand-muted">
                {PEDIGREE_FIELDS.map(({ key, label }) => (
                  <p key={key}>
                    {label}: <span className="text-brand-text">{horse[key] || '—'}</span>
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-brand-muted uppercase mb-2">
                Images <span className="normal-case font-normal">({horse.images.length}/3)</span>
              </p>
              {horse.images.length === 0 ? (
                <p className="text-sm text-brand-muted">No images uploaded.</p>
              ) : (
                <div className="flex gap-2">
                  {horse.images.map(img => (
                    <img
                      key={img.id}
                      src={img.image_url}
                      alt={horse.name}
                      className="w-16 h-16 object-cover rounded-lg border border-brand-border"
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-brand-muted uppercase mb-2">Proof Documents</p>
              <div className="flex flex-col gap-1">
                {DOCUMENT_TYPES.map(({ key, label }) => {
                  const attached = horse.documents?.some(d => d.document_type === key)
                  return (
                    <p key={key} className={`flex items-center gap-2 text-sm ${attached ? 'text-brand-text' : 'text-brand-muted'}`}>
                      {attached ? <Check size={14} className="text-green-600" /> : <X size={14} className="text-brand-muted" />}
                      {label}
                    </p>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-brand-muted uppercase mb-2">
                Race Records <span className="normal-case font-normal">({horse.race_records.length})</span>
              </p>
              {horse.race_records.length === 0 ? (
                <p className="text-sm text-brand-muted">No race records added.</p>
              ) : (
                <ul className="flex flex-col gap-1 text-sm text-brand-muted">
                  {horse.race_records.map(r => (
                    <li key={r.id}>
                      {r.race_date} &middot; {r.race_name} @ {r.course}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {(horse.status === 'draft' || horse.status === 'rejected') && (
            <div className="flex flex-col gap-3 bg-brand-surface border border-brand-border rounded-lg p-6">
              {submit.submitError && <p className="text-red-600 text-sm font-medium">{submit.submitError}</p>}
              <button
                onClick={submit.handleSubmit}
                disabled={submit.submitting || !hasAllDocumentTypes(horse.documents)}
                title={
                  missingDocs.length > 0
                    ? `Missing: ${missingDocs.map(m => DOCUMENT_TYPES.find(t => t.key === m)?.label).join(', ')}`
                    : undefined
                }
                className="self-start bg-brand-gold text-brand-bg font-bold px-6 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submit.submitting
                  ? 'Submitting...'
                  : horse.status === 'rejected'
                  ? 'Resubmit for Review'
                  : 'Submit for Review'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-brand-border">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(prev => (prev - 1) as Step)}
            disabled={imageActionsLocked}
            title={imageActionsLocked ? 'Finish editing (Save or Cancel) before switching sections' : undefined}
            className="text-brand-muted hover:text-brand-text font-bold px-6 py-2 rounded-lg border border-brand-border transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>
        )}
        {step < 3 && (
          <button
            type="button"
            onClick={() => setStep(prev => (prev + 1) as Step)}
            disabled={imageActionsLocked}
            title={imageActionsLocked ? 'Finish editing (Save or Cancel) before switching sections' : undefined}
            className="flex items-center gap-2 bg-brand-gold text-brand-bg font-bold px-6 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export default HorseEditPage
