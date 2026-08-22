import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, changePassword, deleteAccount } from '../modules/auth'

// Owns the Settings tab's logic: the change-password form and the
// delete-account flow. Deleting logs the user out and returns them home.
export function useAccountSettings() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleChangePassword() {
    setPwError(null)
    setPwSuccess(false)
    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New password and confirmation do not match.')
      return
    }
    const token = localStorage.getItem('access_token')
    if (!token) return
    setPwSaving(true)
    try {
      await changePassword(token, pwForm.current, pwForm.next)
      setPwForm({ current: '', next: '', confirm: '' })
      setPwSuccess(true)
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setPwSaving(false)
    }
  }

  async function handleDeleteAccount() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteAccount(token)
      logout()
      navigate('/')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  return {
    pwForm, setPwForm, pwSaving, pwError, pwSuccess, handleChangePassword,
    showDeleteConfirm, setShowDeleteConfirm, deleting, deleteError, setDeleteError, handleDeleteAccount,
  }
}
