import { Check, X } from 'lucide-react'
import { DOCUMENT_TYPES } from '../api/horse'
import { PEDIGREE_FIELDS, type HorseForm } from '../hooks/useAddHorseForm'
import type { useHorseImageDraft } from '../hooks/useHorseImageDraft'
import type { useHorseDocumentDraft } from '../hooks/useHorseDocumentDraft'
import type { useHorseRecordDraft } from '../hooks/useHorseRecordDraft'

type HorseReviewSummaryProps = {
  form: HorseForm
  imageDraft: ReturnType<typeof useHorseImageDraft>
  documentDraft: ReturnType<typeof useHorseDocumentDraft>
  recordDraft: ReturnType<typeof useHorseRecordDraft>
}

// Read-only recap of everything entered in sections 1-2, so the farmer can
// double check before saving/submitting. Purely a view over the drafts —
// no state or API calls of its own.
function HorseReviewSummary({ form, imageDraft, documentDraft, recordDraft }: HorseReviewSummaryProps) {
  const filledPedigree = PEDIGREE_FIELDS.filter(({ key }) => (form[key] as string)?.trim())

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold text-brand-muted uppercase mb-2">Basic Info</p>
        <p className="text-lg font-bold text-brand-text">{form.name || '(no name yet)'}</p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-3 mt-1 text-sm text-brand-muted">
          <p>Color: <span className="text-brand-text">{form.color || '—'}</span></p>
          <p>Gender: <span className="text-brand-text capitalize">{form.gender || '—'}</span></p>
          <p>Date of birth: <span className="text-brand-text">{form.date_of_birth || '—'}</span></p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-brand-muted uppercase mb-2">
          Pedigree <span className="normal-case font-normal">({filledPedigree.length}/{PEDIGREE_FIELDS.length} filled)</span>
        </p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 text-sm text-brand-muted">
          {PEDIGREE_FIELDS.map(({ key, label }) => (
            <p key={key}>
              {label}: <span className="text-brand-text">{(form[key] as string) || '—'}</span>
            </p>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-brand-muted uppercase mb-2">
          Images <span className="normal-case font-normal">({imageDraft.images.length}/3)</span>
        </p>
        {imageDraft.images.length === 0 ? (
          <p className="text-sm text-brand-muted">No images added.</p>
        ) : (
          <div className="flex gap-2">
            {imageDraft.images.map((img, i) => (
              <img
                key={img.url}
                src={img.url}
                alt={`Preview ${i + 1}`}
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
            const attached = Boolean(documentDraft.files[key])
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
          Race Records <span className="normal-case font-normal">({recordDraft.records.length})</span>
        </p>
        {recordDraft.records.length === 0 ? (
          <p className="text-sm text-brand-muted">No race records added.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm text-brand-text">
            {recordDraft.records.map((r, i) => (
              <li key={i} className="text-brand-muted">
                {r.race_date} &middot; {r.race_name} @ {r.course}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default HorseReviewSummary
