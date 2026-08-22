import { useState, useEffect } from 'react'
import { getPendingFarms, updateFarmApproval, type AdminFarm } from '../api/admin'

// Loads farms awaiting admin review and exposes an approve/reject action that
// removes the farm from the queue once it's been decided.
export function useAdminFarmApprovals() {
  const [farms, setFarms] = useState<AdminFarm[]>([])
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('access_token')))
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function load(token: string) {
    getPendingFarms(token)
      .then(setFarms)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load pending farms.'))
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

  async function act(id: number, status: 'active' | 'rejected', reason?: string): Promise<boolean> {
    const token = localStorage.getItem('access_token')
    if (!token) return false
    setBusyId(id)
    setActionError(null)
    try {
      await updateFarmApproval(token, id, status, reason)
      setFarms(prev => prev.filter(f => f.id !== id))
      return true
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update the farm.')
      return false
    } finally {
      setBusyId(null)
    }
  }

  return { farms, loading, error, retry, busyId, actionError, act }
}
