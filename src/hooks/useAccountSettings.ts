import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, requestPasswordReset, deleteAccount } from '../modules/auth'

// Owns the Settings tab's logic: sending the password-reset email and the
// delete-account flow. Deleting logs the user out and returns them home.
export function useAccountSettings() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [pwResetSending, setPwResetSending] = useState(false)
  const [pwResetSent, setPwResetSent] = useState(false)
  const [pwResetError, setPwResetError] = useState<string | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleSendPasswordReset() {
    setPwResetError(null)
    setPwResetSending(true)
    try {
      await requestPasswordReset()
      setPwResetSent(true)
    } catch (err) {
      setPwResetError(err instanceof Error ? err.message : 'Failed to send password reset link')
    } finally {
      setPwResetSending(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteAccount()
      await logout()
      navigate('/')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  return {
    pwResetSending, pwResetSent, pwResetError, handleSendPasswordReset,
    showDeleteConfirm, setShowDeleteConfirm, deleting, deleteError, setDeleteError, handleDeleteAccount,
  }
}
