import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createHorse, createRaceRecord, uploadHorseImage, uploadHorseDocument, submitHorseForReview, DOCUMENT_TYPES, type Horse, type HorseCreate, type RaceRecordCreate, type RaceRecordUpdate } from '../api/horse'
import { recordFormIsValid } from '../components/raceRecordFields'
import { validateName, validateColor, validateDob } from '../horseValidation'
import { useHorseImageDraft } from './useHorseImageDraft'
import { useHorseRecordDraft } from './useHorseRecordDraft'
import { useHorseDocumentDraft } from './useHorseDocumentDraft'

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

// Owns the whole "add horse" flow: the info form plus the image, race-record,
// and document drafts (collected locally). Two end actions share the same
// create-then-upload sequence but differ in what they require: "Save as
// Draft" only needs a name, while "Submit for Review" needs the full form,
// at least one image/race record, and all 3 documents before it also calls
// submitHorseForReview once the horse and its assets exist.
export function useAddHorseForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState<HorseForm>(empty)
  const [pendingAction, setPendingAction] = useState<'draft' | 'submit' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const imageDraft = useHorseImageDraft()
  const recordDraft = useHorseRecordDraft()
  const documentDraft = useHorseDocumentDraft()

  // Full validation — only enforced before Submit for Review, not while saving
  // a draft (a draft only needs a name; everything else can be filled in later).
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

  // Include a fully-filled-but-not-yet-added draft row so it isn't silently lost.
  function collectRecords(): RaceRecordUpdate[] {
    return recordFormIsValid(recordDraft.recordForm)
      ? [...recordDraft.records, recordDraft.recordForm]
      : recordDraft.records
  }

  // Everything Submit for Review requires beyond a draft: the full form,
  // at least one image/race record, and all 3 documents. Returns the records
  // to create, or null (with `error` already set) if something's missing.
  function checkSubmitReady(): RaceRecordUpdate[] | null {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return null
    }
    if (imageDraft.images.length === 0) {
      setError('At least one image is required.')
      return null
    }
    const allRecords = collectRecords()
    // Retired racehorses always have race history, so at least one is required.
    if (allRecords.length === 0) {
      setError('At least one race record is required.')
      return null
    }
    if (DOCUMENT_TYPES.some(({ key }) => !documentDraft.files[key])) {
      setError('All 3 proof documents are required to submit for review.')
      return null
    }
    return allRecords
  }

  // Creates the horse (as a draft) and uploads every image/document/race
  // record against it. Shared by both end actions below.
  async function createAndPopulate(token: string, allRecords: RaceRecordUpdate[]): Promise<Horse> {
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
      // Empty string isn't a valid date for the backend — send null when unset,
      // now that a draft is allowed to leave this blank.
      date_of_birth: form.date_of_birth || null,
      race_records: [],
    })
    // Upload images in the order they were added so their positions match the preview.
    for (const img of imageDraft.images) {
      await uploadHorseImage(token, horse.id, img.file)
    }
    for (const { key } of DOCUMENT_TYPES) {
      const file = documentDraft.files[key]
      if (file) await uploadHorseDocument(token, horse.id, file, key)
    }
    for (const record of allRecords) {
      await createRaceRecord(token, horse.id, toRecordCreate(record))
    }
    return horse
  }

  async function handleSaveDraft(e: FormEvent) {
    e.preventDefault()
    const nameError = validateName(form.name, 'Name')
    if (nameError) {
      setError(nameError)
      return
    }
    const token = localStorage.getItem('access_token')
    if (!token) return

    setPendingAction('draft')
    setError(null)
    try {
      await createAndPopulate(token, collectRecords())
      navigate(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save horse')
    } finally {
      setPendingAction(null)
    }
  }

  async function handleSubmitForReview() {
    const allRecords = checkSubmitReady()
    if (!allRecords) return
    const token = localStorage.getItem('access_token')
    if (!token) return

    setPendingAction('submit')
    setError(null)
    try {
      const horse = await createAndPopulate(token, allRecords)
      await submitHorseForReview(token, horse.id)
      navigate(-1)
    } catch (err) {
      // The horse was already created (as a draft) even if this last step
      // fails — don't navigate away, so the farmer sees why and can retry
      // from the horse's edit page instead of losing track of it.
      setError(err instanceof Error ? err.message : 'Failed to submit horse for review')
    } finally {
      setPendingAction(null)
    }
  }

  return {
    form,
    setForm,
    pendingAction,
    error,
    handleSaveDraft,
    handleSubmitForReview,
    imageDraft,
    recordDraft,
    documentDraft,
  }
}
