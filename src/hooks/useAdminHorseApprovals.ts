import { useState, useEffect } from 'react'
import { getPendingHorses, updateHorseApproval, type AdminHorse } from '../api/admin'

// Loads horses awaiting admin review and exposes an approve/reject action that
// removes the horse from the queue once it's been decided.
export function useAdminHorseApprovals() {
  const [horses, setHorses] = useState<AdminHorse[]>([])
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('access_token')))
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function load(token: string) {
    getPendingHorses(token)
      .then(setHorses)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load pending horses.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    load(token)
  }, [])

  function retry() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setLoading(true)
    setError(null)
    load(token)
  }

  async function act(id: number, status: 'approved' | 'rejected', reason?: string): Promise<boolean> {
    const token = localStorage.getItem('access_token')
    if (!token) return false
    setBusyId(id)
    setActionError(null)
    try {
      await updateHorseApproval(token, id, status, reason)
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
