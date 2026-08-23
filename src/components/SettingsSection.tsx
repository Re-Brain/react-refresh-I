import { Lock, AlertTriangle, X } from 'lucide-react'
import type { useAccountSettings } from '../hooks/useAccountSettings'

type SettingsSectionProps = {
  settings: ReturnType<typeof useAccountSettings>
}

// Settings tab: change-password form and the destructive delete-account flow
// (with an inline confirm step). All logic lives in the useAccountSettings hook.
function SettingsSection({ settings }: SettingsSectionProps) {
  const {
    pwResetSending, pwResetSent, pwResetError, handleSendPasswordReset,
    showDeleteConfirm, setShowDeleteConfirm, deleting, deleteError, setDeleteError, handleDeleteAccount,
  } = settings

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-brand-gold mb-6">Settings</h2>

      <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4 mb-6">
        <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h3>
        <p className="text-brand-muted text-sm">
          We&rsquo;ll email a password reset link to your account email address.
        </p>
        {pwResetError && <p className="text-red-600 text-sm">{pwResetError}</p>}
        {pwResetSent ? (
          <p className="text-green-400 text-sm">
            Check your email — we sent a password reset link to your account email address.
          </p>
        ) : (
          <button
            onClick={handleSendPasswordReset}
            disabled={pwResetSending}
            className="self-start bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
          >
            {pwResetSending ? 'Sending...' : 'Send Password Reset Link'}
          </button>
        )}
      </div>

      <div className="bg-brand-surface border border-red-500/40 rounded-lg p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle size={18} /> Delete Account
        </h3>
        <p className="text-brand-muted text-sm">
          Permanently delete your account, your farm, and all associated horses. This action
          cannot be undone.
        </p>
        {deleteError && <p className="text-red-600 text-sm">{deleteError}</p>}
        {!showDeleteConfirm ? (
          <button
            onClick={() => { setDeleteError(null); setShowDeleteConfirm(true) }}
            className="self-start bg-red-500/10 text-red-600 border border-red-500/40 font-bold px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-sm"
          >
            Delete Account
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-brand-text text-sm font-bold">
              Are you absolutely sure? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex items-center gap-1 text-brand-muted hover:text-brand-text text-sm font-bold px-4 py-2 rounded-lg border border-brand-border transition"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsSection
