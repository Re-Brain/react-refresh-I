import { useState, useEffect } from 'react'
import { getPendingHorses, updateHorseApproval, type AdminHorse } from '../api'

// Loads horses awaiting admin review and exposes an approve/reject action that
// removes the horse from the queue once it's been decided.
export function useAdminHorseApprovals() {
  const [horses, setHorses] = useState<AdminHorse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function load() {
    getPendingHorses()
      .then(setHorses)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load pending horses.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function retry() {
    setLoading(true)
    setError(null)
    load()
  }

  async function act(id: number, status: 'approved' | 'rejected', reason?: string): Promise<boolean> {
    setBusyId(id)
    setActionError(null)
    try {
      await updateHorseApproval(id, status, reason)
      setHorses(prev => prev.filter(h => h.id !== id))
      return true
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update the horse.')
      return false
    } finally {
      setBusyId(null)
    }
  }

  return { horses, loading, error, retry, busyId, actionError, act }
}
