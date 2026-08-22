import type { Dispatch, SetStateAction } from 'react'
import { X, Info, AlertTriangle } from 'lucide-react'
import { isFarmComplete, type Farm } from '../api/farm'
import type { useFarmInfoForm } from '../hooks/useFarmInfoForm'
import type { useFarmDocuments } from '../hooks/useFarmDocuments'
import type { useFarmSubmit } from '../hooks/useFarmSubmit'
import FarmImageManager from './FarmImageManager'
import FarmDocumentManager from './FarmDocumentManager'
import { FARM_STATUS_STYLES, FARM_STATUS_LABELS } from '../lib/approvalStatusDisplay'
import { hasAllFarmDocumentTypes, missingFarmDocumentTypes } from '../lib/farmDocuments'
import { FARM_DOCUMENT_TYPES } from '../api/farm'

type FarmInfoSectionProps = {
  farm: Farm | null
  setFarm: Dispatch<SetStateAction<Farm | null>>
  info: ReturnType<typeof useFarmInfoForm>
  documents: ReturnType<typeof useFarmDocuments>
  submit: ReturnType<typeof useFarmSubmit>
}

// Farm Info tab: a read-only view of name/description/location with an
// Edit button that swaps in the form, the image and document managers, and a
// Submit for Review action while the farm is a draft (or was rejected).
// Mirrors HorseEditPage's status banners and draft -> pending workflow.
function FarmInfoSection({ farm, setFarm, info, documents, submit }: FarmInfoSectionProps) {
  const { isEditing, setIsEditing, formData, setFormData, saving, saveError, handleEditClick, handleSave } = info

  // Every edit endpoint 409s while pending, so lock the whole page read-only
  // (mirrors the horse detail page).
  const readOnly = farm?.status === 'pending'
  const sectionsLocked = isEditing || documents.busy || readOnly
  const missingDocs = farm ? missingFarmDocumentTypes(farm.documents) : []
  const hasPhoto = Boolean(farm && farm.images.length > 0)
  const canSubmit = Boolean(farm && isFarmComplete(farm) && hasAllFarmDocumentTypes(farm.documents) && hasPhoto)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-brand-gold">Farm Info</h2>
        {farm && (
          <span
            className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${FARM_STATUS_STYLES[farm.status]}`}
          >
            {FARM_STATUS_LABELS[farm.status]}
          </span>
        )}
      </div>

      {farm?.status === 'draft' && (
        <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/40 text-blue-500 rounded-lg px-4 py-3 mb-6 text-sm font-medium">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>This farm is a draft and won&rsquo;t be visible to visitors until it&rsquo;s submitted and approved. Complete your profile, upload the required documents, and submit for review below.</p>
        </div>
      )}

      {farm?.status === 'pending' && (
        <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-lg px-4 py-3 mb-6 text-sm font-medium">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>This farm is pending admin review and won&rsquo;t be visible to visitors until it&rsquo;s approved.</p>
        </div>
      )}

      {farm?.status === 'rejected' && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm font-medium">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">This farm was rejected.</p>
            {farm.rejection_reason && <p className="mt-0.5">{farm.rejection_reason}</p>}
            <p className="mt-0.5 font-normal">Fix the issue above, then resubmit below.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-6">
          {isEditing ? (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase">Farm Name</label>
                <input
                  className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                  value={formData.name ?? ''}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase">Description</label>
                <textarea
                  rows={3}
                  className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold resize-none"
                  value={formData.description ?? ''}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase">Location</label>
                <input
                  className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                  value={formData.location ?? ''}
                  onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                />
              </div>
              {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 text-brand-muted hover:text-brand-text text-sm font-bold px-4 py-2 rounded-lg border border-brand-border transition"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase">Farm Name</label>
                <p className="text-brand-text font-bold text-lg">{farm?.name ?? '—'}</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase">Description</label>
                <p className="text-brand-text">{farm?.description ?? '—'}</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase">Location</label>
                <p className="text-brand-text">{farm?.location ?? '—'}</p>
              </div>
              <button
                onClick={handleEditClick}
                disabled={readOnly}
                title={readOnly ? 'This farm is pending review and can’t be edited right now' : undefined}
                className="self-start bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit Farm Info
              </button>
            </>
          )}
        </div>
        {farm && <FarmImageManager farm={farm} onChange={setFarm} disabled={sectionsLocked} />}
        {farm && <FarmDocumentManager farm={farm} documents={documents} locked={sectionsLocked} />}

        {farm && (farm.status === 'draft' || farm.status === 'rejected') && (
          <div className="flex flex-col gap-3 bg-brand-surface border border-brand-border rounded-lg p-6">
            {submit.submitError && <p className="text-red-600 text-sm font-medium">{submit.submitError}</p>}
            <button
              onClick={submit.handleSubmit}
              disabled={submit.submitting || !canSubmit}
              title={
                !canSubmit
                  ? [
                      !isFarmComplete(farm) && 'Complete your farm profile',
                      !hasPhoto && 'Add at least one farm photo',
                      missingDocs.length > 0 &&
                        `Missing: ${missingDocs.map(m => FARM_DOCUMENT_TYPES.find(t => t.key === m)?.label).join(', ')}`,
                    ]
                      .filter(Boolean)
                      .join(' — ')
                  : undefined
              }
              className="self-start bg-brand-gold text-brand-bg font-bold px-6 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submit.submitting
                ? 'Submitting...'
                : farm.status === 'rejected'
                ? 'Resubmit for Review'
                : 'Submit for Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmInfoSection
