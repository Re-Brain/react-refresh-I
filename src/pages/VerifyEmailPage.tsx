import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/auth'

type Status = 'verifying' | 'success' | 'error'

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>('verifying')
  const [error, setError] = useState('')

  // Guards against React 18 StrictMode's double-invoked effect firing the
  // verification request twice in dev (harmless since the endpoint is
  // idempotent, but avoids a redundant network call).
  const requested = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('This verification link is missing a token.')
      return
    }
    if (requested.current) return
    requested.current = true

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'This verification link is invalid or has expired.')
      })
  }, [token])

  return (
    <div className="min-h-[calc(100vh-3.25rem)] bg-brand-bg text-brand-text flex items-center justify-center">
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 w-full max-w-md text-center">
        {status === 'verifying' && (
          <>
            <h1 className="text-3xl font-bold text-brand-gold mb-4">Verifying...</h1>
            <p className="text-brand-muted">Hang on while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-3xl font-bold text-brand-gold mb-4">Email verified</h1>
            <p className="text-brand-muted mb-6">Your email has been verified. You can now log in.</p>
            <Link
              to="/login"
              className="inline-block bg-brand-gold text-brand-bg font-bold py-2 px-6 rounded-lg hover:bg-brand-gold-light transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-3xl font-bold text-brand-gold mb-4">Verification failed</h1>
            <p className="text-red-600 text-sm mb-6">{error}</p>
            <p className="text-brand-muted text-sm">
              Please contact support if you need a new verification link.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailPage
