import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createHorse, createRaceRecord, uploadHorseImage, type HorseCreate, type RaceRecordCreate, type RaceRecordUpdate } from '../api/horse'
import { recordFormIsValid } from '../components/raceRecordFields'
import { validateName, validateColor, validateDob } from '../horseValidation'
import { useHorseImageDraft } from './useHorseImageDraft'
import { useHorseRecordDraft } from './useHorseRecordDraft'

export type HorseForm = Omit<HorseCreate, 'race_records'>

export const PEDIGREE_FIELDS: { key: keyof HorseForm; label: string }[] = [
  { key: 'sire', label: 'Sire' },
  { key: 'dam', label: 'Dam' },
  { key: 'sires_sire', label: "Sire's Sire" },
  { key: 'dams_sire', label: "Dam's Sire" },
  { key: 'sires_dam', label: "Sire's Dam" },
  { key: 'dams_dam', label: "Dam's Dam" },
]

const empty: HorseForm = {
  name: '',
  story: '',
  date_of_birth: '',
  color: '',
  gender: null,
  sire: '',
  dam: '',
  sires_sire: '',
  sires_dam: '',
  dams_sire: '',
  dams_dam: '',
}

// Turn a draft row into the payload the create-record endpoint expects.
function toRecordCreate(draft: RaceRecordUpdate): RaceRecordCreate {
  return { ...draft, grade: draft.grade || null, finish_position: draft.finish_position ?? null } as RaceRecordCreate
}

// Owns the whole "add horse" flow: the info form plus the image and race-record
// drafts (collected locally). On submit it validates, creates the horse, then
// uploads the images and creates the records against the new horse's id.
export function useAddHorseForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState<HorseForm>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const imageDraft = useHorseImageDraft()
  const recordDraft = useHorseRecordDraft()

  function validate(): string | null {
    const nameError = validateName(form.name, 'Name')
    if (nameError) return nameError
    const colorError = validateColor(form.color ?? '')
    if (colorError) return colorError
    if (!form.gender) return 'Gender is required.'
    for (const { key, label } of PEDIGREE_FIELDS) {
      const err = validateName((form[key] as string) ?? '', label)
      if (err) return err
    }
    return validateDob(form.date_of_birth ?? '')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    if (imageDraft.images.length === 0) {
      setError('At least one image is required.')
      return
    }
    const token = localStorage.getItem('access_token')
    if (!token) return
    // Include a fully-filled-but-not-yet-added draft row so it isn't silently lost.
    const allRecords = recordFormIsValid(recordDraft.recordForm)
      ? [...recordDraft.records, recordDraft.recordForm]
      : recordDraft.records
    // Retired racehorses always have race history, so at least one is required.
    if (allRecords.length === 0) {
      setError('At least one race record is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const horse = await createHorse(token, {
        ...form,
        name: form.name.trim(),
        story: (form.story ?? '').trim(),
        color: (form.color ?? '').trim(),
        sire: (form.sire ?? '').trim(),
        dam: (form.dam ?? '').trim(),
        sires_sire: (form.sires_sire ?? '').trim(),
        dams_sire: (form.dams_sire ?? '').trim(),
        sires_dam: (form.sires_dam ?? '').trim(),
        dams_dam: (form.dams_dam ?? '').trim(),
        race_records: [],
      })
      // Upload images in the order they were added so their positions match the preview.
      for (const img of imageDraft.images) {
        await uploadHorseImage(token, horse.id, img.file)
      }
      for (const record of allRecords) {
        await createRaceRecord(token, horse.id, toRecordCreate(record))
      }
      navigate(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add horse')
    } finally {
      setSaving(false)
    }
  }

  return { form, setForm, saving, error, handleSubmit, imageDraft, recordDraft }
}
