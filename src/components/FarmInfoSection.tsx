import type { Dispatch, SetStateAction } from 'react'
import { X } from 'lucide-react'
import type { Farm } from '../api/farm'
import type { useFarmInfoForm } from '../hooks/useFarmInfoForm'
import FarmImageManager from './FarmImageManager'

type FarmInfoSectionProps = {
  farm: Farm | null
  setFarm: Dispatch<SetStateAction<Farm | null>>
  info: ReturnType<typeof useFarmInfoForm>
}

// Farm Info tab: a read-only view of name/description/capacity/location with an
// Edit button that swaps in the form, plus the farm image manager. All form
// state and save logic live in the useFarmInfoForm hook.
function FarmInfoSection({ farm, setFarm, info }: FarmInfoSectionProps) {
  const { isEditing, setIsEditing, formData, setFormData, saving, saveError, handleEditClick, handleSave } = info

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-gold mb-6">Farm Info</h2>
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
                <label className="text-xs font-bold text-brand-muted uppercase">Capacity</label>
                <input
                  type="number"
                  min={1}
                  className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                  value={formData.capacity ?? ''}
                  onChange={e => setFormData(p => ({ ...p, capacity: e.target.value === '' ? undefined : Number(e.target.value) }))}
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
                <label className="text-xs font-bold text-brand-muted uppercase">Capacity</label>
                <p className="text-brand-text">{farm?.capacity ?? '—'}</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase">Location</label>
                <p className="text-brand-text">{farm?.location ?? '—'}</p>
              </div>
              <button
                onClick={handleEditClick}
                className="self-start bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm"
              >
                Edit Farm Info
              </button>
            </>
          )}
        </div>
        {farm && <FarmImageManager farm={farm} onChange={setFarm} disabled={isEditing} />}
      </div>
    </div>
  )
}

export default FarmInfoSection
