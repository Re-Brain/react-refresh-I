import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    if (!token) {
      setError('This reset link is missing a token.')
      return
    }
    setSubmitting(true)
    try {
      await resetPassword(token, newPassword)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'This reset link is invalid or has expired.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.25rem)] bg-brand-bg text-brand-text flex items-center justify-center">
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 w-full max-w-md text-center">
        {success ? (
          <>
            <h1 className="text-3xl font-bold text-brand-gold mb-4">Password reset</h1>
            <p className="text-brand-muted mb-6">Your password has been changed. You can now log in.</p>
            <Link
              to="/login"
              className="inline-block bg-brand-gold text-brand-bg font-bold py-2 px-6 rounded-lg hover:bg-brand-gold-light transition"
            >
              Go to Login
            </Link>
          </>
        ) : !token ? (
          <>
            <h1 className="text-3xl font-bold text-brand-gold mb-4">Invalid link</h1>
            <p className="text-red-600 text-sm mb-6">This reset link is missing a token.</p>
            <p className="text-brand-muted text-sm">
              Please request a new reset link from your account settings.
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="text-left">
            <h1 className="text-3xl font-bold text-brand-gold mb-4 text-center">Reset your password</h1>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase">New Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase">Confirm New Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-gold"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !newPassword || !confirmPassword}
                className="bg-brand-gold text-brand-bg font-bold py-2 px-6 rounded-lg hover:bg-brand-gold-light transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
