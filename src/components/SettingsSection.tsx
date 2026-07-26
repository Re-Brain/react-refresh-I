import { Lock, AlertTriangle, X } from 'lucide-react'
import type { useAccountSettings } from '../hooks/useAccountSettings'

type SettingsSectionProps = {
  settings: ReturnType<typeof useAccountSettings>
}

// Settings tab: change-password form and the destructive delete-account flow
// (with an inline confirm step). All logic lives in the useAccountSettings hook.
function SettingsSection({ settings }: SettingsSectionProps) {
  const {
    pwForm, setPwForm, pwSaving, pwError, pwSuccess, handleChangePassword,
    showDeleteConfirm, setShowDeleteConfirm, deleting, deleteError, setDeleteError, handleDeleteAccount,
  } = settings

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-brand-gold mb-6">Settings</h2>

      <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-4 mb-6">
        <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-bold text-brand-muted uppercase">Current Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
              value={pwForm.current}
              onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-brand-muted uppercase">New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
              value={pwForm.next}
              onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-brand-muted uppercase">Confirm New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
              value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
            />
          </div>
        </div>
        {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
        {pwSuccess && <p className="text-green-400 text-sm">Password changed successfully.</p>}
        <button
          onClick={handleChangePassword}
          disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
          className="self-start bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm disabled:opacity-50"
        >
          {pwSaving ? 'Saving...' : 'Update Password'}
        </button>
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
