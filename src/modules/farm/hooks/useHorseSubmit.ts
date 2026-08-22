import { useState, type Dispatch, type SetStateAction } from 'react'
import { submitHorseForReview, type Horse } from '../api/horse'

// Moves a draft horse to "pending" once all 3 documents are present. Missing
// documents should block the button client-side (see hasAllDocumentTypes);
// submitError is the fallback for whatever slips through (stale state, races).
export function useHorseSubmit(horse: Horse | null, setHorse: Dispatch<SetStateAction<Horse | null>>) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!horse) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const updated = await submitHorseForReview(horse.id)
      setHorse(updated)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit horse for review')
    } finally {
      setSubmitting(false)
    }
  }

  return { submitting, submitError, handleSubmit }
}
