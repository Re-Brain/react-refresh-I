import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, requestPasswordReset, deleteAccount } from '../modules/auth'

// Owns the Settings tab's logic: sending the password-reset email and the
// delete-account flow. Deleting logs the user out and returns them home.
export function useAccountSettings() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [pwResetSending, setPwResetSending] = useState(false)
  const [pwResetError, setPwResetError] = useState<string | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Requesting a reset link also ends the current session immediately (the
  // backend revokes it server-side; logging out here clears this tab's
  // cookies right away instead of waiting for the next API call to 401) so
  // the dashboard isn't still reachable while the email is in flight.
  async function handleSendPasswordReset() {
    setPwResetError(null)
    setPwResetSending(true)
    try {
      await requestPasswordReset()
      await logout()
      navigate('/login', {
        state: { notice: 'We sent a password reset link to your email. You have been logged out for security — use the link to set a new password, then log back in.' },
      })
    } catch (err) {
      setPwResetError(err instanceof Error ? err.message : 'Failed to send password reset link')
      setPwResetSending(false)
      setShowResetConfirm(false)
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
    showResetConfirm, setShowResetConfirm, pwResetSending, pwResetError, handleSendPasswordReset,
    showDeleteConfirm, setShowDeleteConfirm, deleting, deleteError, setDeleteError, handleDeleteAccount,
  }
}
