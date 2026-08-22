import { useState, type Dispatch, type SetStateAction } from 'react'
import { submitFarmForReview, type Farm } from '../api/farm'

// Moves a draft (or rejected) farm to "pending" once the profile is complete
// and all 3 documents are present. Those requirements should block the button
// client-side; submitError is the fallback for whatever slips through (stale
// state, races). Mirrors useHorseSubmit.
export function useFarmSubmit(farm: Farm | null, setFarm: Dispatch<SetStateAction<Farm | null>>) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!farm) return
    const token = localStorage.getItem('access_token')
    if (!token) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const updated = await submitFarmForReview(token)
      setFarm(updated)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit farm for review')
    } finally {
      setSubmitting(false)
    }
  }

  return { submitting, submitError, handleSubmit }
}
