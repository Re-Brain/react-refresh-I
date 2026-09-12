import { Link, useLocation } from 'react-router-dom'

function CheckEmailPage() {
  // The email is passed via router state from the registration (or login)
  // page that redirected here; fall back to generic copy if it's missing
  // (e.g. someone navigates to this URL directly).
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email

  return (
    <div className="min-h-[calc(100vh-3.25rem)] bg-brand-bg text-brand-text flex items-center justify-center px-4 xs:px-6 sm:px-8">
      <div className="bg-brand-surface border border-brand-border rounded-lg p-6 xs:p-8 w-full max-w-md text-center">
        <h1 className="text-2xl xs:text-3xl font-bold text-brand-gold mb-4">Check your email</h1>
        <p className="text-brand-muted mb-2">
          We sent a verification link to{' '}
          {email ? <span className="text-brand-text font-bold">{email}</span> : 'your email address'}.
        </p>
        <p className="text-brand-muted mb-2">
          Click the link to verify your account, then come back and log in. The link expires in 24 hours.
        </p>
        <p className="text-brand-muted mb-6">Don&rsquo;t see it? Check your spam or junk folder.</p>
        <Link
          to="/login"
          className="inline-block bg-brand-gold text-brand-bg font-bold py-2 px-6 rounded-lg hover:bg-brand-gold-light transition"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}

export default CheckEmailPage
