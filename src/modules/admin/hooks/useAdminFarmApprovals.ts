import { useState, useEffect } from 'react'
import { getPendingFarms, updateFarmApproval, type AdminFarm } from '../api'

// Loads farms awaiting admin review and exposes an approve/reject action that
// removes the farm from the queue once it's been decided.
export function useAdminFarmApprovals() {
  const [farms, setFarms] = useState<AdminFarm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function load() {
    getPendingFarms()
      .then(setFarms)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load pending farms.'))
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

  async function act(id: number, status: 'active' | 'rejected', reason?: string): Promise<boolean> {
    setBusyId(id)
    setActionError(null)
    try {
      await updateFarmApproval(id, status, reason)
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
