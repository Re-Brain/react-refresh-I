import { useState, type Dispatch, type SetStateAction } from 'react'
import { updateMyFarm, type Farm, type FarmUpdate } from '../api/farm'

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

    setSaving(true)
    setSaveError(null)
    try {
      // Only send changed fields. Treat '' / undefined / null as the same
      // "empty" on both sides so untouched empty fields aren't sent, and send an
      // explicit null (not '' or 0) when clearing a field.
      const payload: FarmUpdate = {}
      if (formData.name && formData.name !== farm.name) payload.name = formData.name
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
