import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login, getMe, ApiError } from '../api'
import { useAuth } from '../context/useAuth'
import { useRetryCountdown, formatCountdown } from '../../../hooks/useRetryCountdown'

function LoginPage() {

  // Get the navigate function from react-router-dom to programmatically navigate after login
  const navigate = useNavigate()

  // Get the "from" location from the state, if it exists. This is used to redirect the user back to the page they were trying to access before being prompted to log in.
  const location = useLocation()

  // Where the user was headed before being bounced to login. A protected route
  // (e.g. the booking flow) passes its own path in `location.state.from`.
  const rawFrom = (location.state as { from?: string } | null)?.from

  // Only honor `from` if it's a booking path, so a crafted state value can't
  // redirect the user somewhere unexpected after login; anything else falls
  // back to /dashboard at navigate time.
  const from = rawFrom?.startsWith('/book/') ? rawFrom : undefined

  // Informational banner for redirects that need to explain themselves, e.g.
  // being logged out after requesting a password reset from Settings.
  const notice = (location.state as { notice?: string } | null)?.notice

  // Get the setUser function from the useAuth context to update the user state after a successful login
  const { setUser } = useAuth()

  // State for email, password, and error message
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Set when the backend rejects login with 403 (email not verified yet), so
  // we can render a link back to "check your email" instead of plain text.
  const [unverified, setUnverified] = useState(false)

  // Ticks down after a 429, disabling the submit button so the user isn't
  // tempted to keep clicking and re-triggering the still-active limit.
  const retry = useRetryCountdown()

  // Handle form submission for login
  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    setUnverified(false)
    try {

      await login(email, password)

      // Reset the dashboard section in sessionStorage to ensure the user starts fresh after login
      sessionStorage.removeItem('dashboardSection')

      // Fetch the user data after successful login and update the user state in the context
      const user = await getMe()

      // Update the user state in the context with the fetched user data
      setUser(user)

      // Navigate to the original destination or the dashboard after successful login
      navigate(from ?? '/dashboard', { replace: true })

    } catch (err: unknown) {

      if (err instanceof ApiError && err.status === 403) {
        setUnverified(true)
      }
      if (err instanceof ApiError && err.status === 429 && err.retryAfterSeconds) {
        retry.start(err.retryAfterSeconds)
      }
      if (err instanceof Error) setError(err.message)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.25rem)] bg-brand-bg text-brand-text flex items-center justify-center">
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 w-full max-w-md">
        
        {/* Page title */}
        <h1 className="text-3xl font-bold text-brand-gold mb-6 text-center">Login</h1>

        {notice && (
          <p className="bg-brand-gold/10 border border-brand-gold/40 text-brand-text text-sm rounded-lg px-4 py-3 mb-4">
            {notice}
          </p>
        )}

        {/* Login form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          
          {/* Email input field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-brand-muted">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition"
            />
          </div>

          {/* Password input field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-brand-muted">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition"
            />
          </div>
          {/* Display error message if login fails */}
          {error && (
            <p className="text-red-600 text-sm">
              {error}
              {unverified && (
                <>
                  {' '}
                  <Link to="/check-email" state={{ email }} className="text-brand-gold hover:underline">
                    Check your email
                  </Link>
                </>
              )}
            </p>
          )}

          {/* Submit button for login */}
          <button
            type="submit"
            disabled={retry.secondsLeft > 0}
            className="bg-brand-gold text-brand-bg font-bold py-2 rounded-lg hover:bg-brand-gold-light transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retry.secondsLeft > 0 ? `Try again in ${formatCountdown(retry.secondsLeft)}` : 'Login'}
          </button>
          
        </form>
      </div>
    </div>
  )
}

export default LoginPage
