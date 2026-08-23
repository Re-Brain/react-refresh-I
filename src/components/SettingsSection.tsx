import { Lock, AlertTriangle } from 'lucide-react'
import type { useAccountSettings } from '../hooks/useAccountSettings'
import ConfirmDialog from './ConfirmDialog'

type SettingsSectionProps = {
  settings: ReturnType<typeof useAccountSettings>
}

// Settings tab: the password-reset trigger and the destructive delete-account
// flow, each confirmed via a ConfirmDialog popup. All logic lives in the
// useAccountSettings hook.
function SettingsSection({ settings }: SettingsSectionProps) {
  const {
    showResetConfirm, setShowResetConfirm, pwResetSending, pwResetError, handleSendPasswordReset,
    showDeleteConfirm, setShowDeleteConfirm, deleting, deleteError, setDeleteError, handleDeleteAccount,
  } = settings

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-brand-gold mb-6">Settings</h2>

      <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4 mb-6">
        <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h3>
        {pwResetError && <p className="text-red-600 text-sm">{pwResetError}</p>}
        <button
          onClick={() => setShowResetConfirm(true)}
          disabled={pwResetSending}
          className="self-start bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
        >
          {pwResetSending ? 'Sending...' : 'Send Password Reset Link'}
        </button>
      </div>

      {showResetConfirm && (
        <ConfirmDialog
          title="Reset your password?"
          message="We'll send a password reset link to your registered email address. You'll be logged out immediately for security — check your email and click the link to set a new password, then log back in."
          confirmLabel="Send Reset Link"
          confirmingLabel="Sending…"
          busy={pwResetSending}
          onConfirm={handleSendPasswordReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      <div className="bg-brand-surface border border-red-500/40 rounded-lg p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle size={18} /> Delete Account
        </h3>
        {deleteError && <p className="text-red-600 text-sm">{deleteError}</p>}
        <button
          onClick={() => { setDeleteError(null); setShowDeleteConfirm(true) }}
          className="self-start bg-red-500/10 text-red-600 border border-red-500/40 font-bold px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-sm"
        >
          Delete Account
        </button>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete your account?"
          message="This permanently deletes your account, your farm, and all associated horses. This action cannot be undone."
          confirmLabel="Yes, delete my account"
          confirmingLabel="Deleting…"
          danger
          busy={deleting}
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

export default SettingsSection
