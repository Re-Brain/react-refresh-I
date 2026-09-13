import { useState, type Dispatch, type SetStateAction } from 'react'
import { updateHorse, type Horse, type HorseUpdate } from '../api/horse'
import { validateName, validateColor, validateDob, validateStory } from '../horseValidation'

// The pedigree fields (key + display label), used for both validation and the
// edit form. Shared by the hook (validation) and HorseInfoEditor (rendering).
// Typed as a literal union (not the broader `keyof HorseUpdate`) so
// `horse[key]`/`formData[key]` are known to be strings, not e.g. race_records.
type PedigreeFieldKey = 'sire' | 'dam' | 'sires_sire' | 'dams_sire' | 'sires_dam' | 'dams_dam'

export const PEDIGREE_FIELDS: { key: PedigreeFieldKey; label: string }[] = [
  { key: 'sire', label: 'Sire' },
  { key: 'dam', label: 'Dam' },
  { key: 'sires_sire', label: "Sire's Sire" },
  { key: 'dams_sire', label: "Dam's Sire" },
  { key: 'sires_dam', label: "Sire's Dam" },
  { key: 'dams_dam', label: "Dam's Dam" },
]

// Owns the edit-mode state, form draft, and save logic for a horse's basic
// info / story / pedigree. `handleSave` validates, sends only the changed
// fields, and updates the shared horse on success.
export function useHorseInfoForm(horse: Horse | null, setHorse: Dispatch<SetStateAction<Horse | null>>) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<HorseUpdate>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleEditClick() {
    if (!horse) return
    setFormData({
      name: horse.name,
      story: horse.story ?? '',
      date_of_birth: horse.date_of_birth ?? '',
      color: horse.color ?? '',
      gender: horse.gender ?? undefined,
      sire: horse.sire ?? '',
      dam: horse.dam ?? '',
      sires_sire: horse.sires_sire ?? '',
      dams_sire: horse.dams_sire ?? '',
      sires_dam: horse.sires_dam ?? '',
      dams_dam: horse.dams_dam ?? '',
    })
    setError(null)
    setIsEditing(true)
  }

  async function handleSave() {
    if (!horse) return

    // A draft can be saved incrementally — only format is checked, not
    // presence. Everything becomes required again once it's been submitted.
    const required = horse.status !== 'draft'
    const validationError =
      validateName(formData.name ?? '', 'Name', required) ??
      validateColor(formData.color ?? '', required) ??
      validateStory(formData.story ?? '', required) ??
      (required && !formData.gender ? 'Gender is required.' : null) ??
      PEDIGREE_FIELDS.reduce<string | null>(
        (err, { key, label }) => err ?? validateName((formData[key] as string) ?? '', label, required),
        null,
      ) ??
      validateDob(formData.date_of_birth ?? '', required)

    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)
    try {
      const trimmed = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => {
          if (typeof v !== 'string') return [k, v]
          const t = v.trim()
          // Empty string isn't a valid date for the backend — send null instead.
          return k === 'date_of_birth' ? [k, t || null] : [k, t]
        })
      )
      // Send only fields that actually changed from the current horse.
      const payload = Object.fromEntries(
        Object.entries(trimmed).filter(([k, v]) => v !== horse[k as keyof Horse])
      ) as HorseUpdate

      const updated = await updateHorse(horse.id, payload)
      setHorse(updated)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return { isEditing, setIsEditing, formData, setFormData, saving, error, handleEditClick, handleSave }
}
