import { useState, type Dispatch, type SetStateAction } from 'react'
import { updateMyFarm, type Farm, type FarmUpdate } from '../api/farm'

// "Farm name" / "Farm name and Description" / "Farm name, Description, and Location"
function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

// Owns the farm-info edit state and save logic. `handleSave` diffs the form
// against the current farm and sends only the fields that changed.
export function useFarmInfoForm(farm: Farm | null, setFarm: Dispatch<SetStateAction<Farm | null>>) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FarmUpdate>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function handleEditClick() {
    if (!farm) return
    setFormData({
      name: farm.name,
      location: farm.location ?? '',
      description: farm.description ?? '',
    })
    setSaveError(null)
    setIsEditing(true)
  }

  async function handleSave() {
    if (!farm) return

    // Name, description, and location are all required on every save,
    // draft or not — the asterisk next to each label always means "enforced
    // right now," with no conditional state to reason about.
    const missing = [
      !formData.name?.trim() && 'Farm name',
      !formData.description?.trim() && 'Description',
      !formData.location?.trim() && 'Location',
    ].filter((field): field is string => Boolean(field))

    if (missing.length > 0) {
      setSaveError(`${joinWithAnd(missing)} ${missing.length > 1 ? 'are' : 'is'} required.`)
      return
    }

    setSaving(true)
    setSaveError(null)
    try {
      // Only send changed fields. Treat '' / undefined / null as the same
      // "empty" on both sides so untouched empty fields aren't sent, and send an
      // explicit null (not '' or 0) when clearing a field.
      const payload: FarmUpdate = {}
      if (formData.name !== farm.name) payload.name = formData.name
      if ((formData.location ?? '') !== (farm.location ?? ''))
        payload.location = formData.location || null
      if ((formData.description ?? '') !== (farm.description ?? ''))
        payload.description = formData.description || null

      const updated = await updateMyFarm(payload)
      setFarm(updated)
      setIsEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return { isEditing, setIsEditing, formData, setFormData, saving, saveError, handleEditClick, handleSave }
}
