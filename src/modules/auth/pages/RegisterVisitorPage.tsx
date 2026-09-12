import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { registerVisitor, ApiError } from '../api'
import { useRetryCountdown, formatCountdown } from '../../../hooks/useRetryCountdown'

function RegisterVisitorPage() {

  // Get the navigate function from react-router-dom to programmatically navigate after successful registration
  const navigate = useNavigate()

  // State for name, email, password, and error message
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const passwordTooShort = password.length > 0 && password.length < 8
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  // Ticks down after a 429, disabling the submit button so the user isn't
  // tempted to keep clicking and re-triggering the still-active limit.
  const retry = useRetryCountdown()

   // Handle form submission for visitor registration
  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    try {

      // Register the visitor, then send them to the "check your email" screen
      // since the account isn't usable until the verification link is clicked.
      await registerVisitor(name, email, password)
      navigate('/check-email', { state: { email } })
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 429 && err.retryAfterSeconds) {
        retry.start(err.retryAfterSeconds)
      }
      if (err instanceof Error) setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center px-4 xs:px-6 sm:px-8">
      <div className="bg-brand-surface border border-brand-border rounded-lg p-6 xs:p-8 w-full max-w-md">

        {/* Page title */}
        <h1 className="text-2xl xs:text-3xl font-bold text-brand-gold mb-1 text-center">Visitor Register</h1>
        
        {/* Page subtitle */}
        <p className="text-brand-muted text-center mb-6">Create your visitor account</p>
        
        {/* Registration form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          
          {/* Name input field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-brand-muted">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition"
            />
          </div>

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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-brand-bg border border-brand-border rounded-lg w-full px-4 py-2 pr-10 text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordTooShort && <p className="text-red-600 text-sm">Password must be at least 8 characters.</p>}
          </div>

          {/* Confirm Password input field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-brand-muted">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="bg-brand-bg border border-brand-border rounded-lg w-full px-4 py-2 pr-10 text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(v => !v)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordsMismatch && <p className="text-red-600 text-sm">Passwords don't match</p>}
          </div>

          {/* Display error message if registration fails */}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          
          {/* Submit button for registration */}
          <button
            type="submit"
            disabled={retry.secondsLeft > 0 || password.length < 8 || password !== confirmPassword}
            className="bg-brand-gold text-brand-bg font-bold py-2 rounded-lg hover:bg-brand-gold-light transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retry.secondsLeft > 0 ? `Try again in ${formatCountdown(retry.secondsLeft)}` : 'Create Account'}
          </button>
        </form>

        {/* Links to login and farmer registration pages */}
        <p className="text-center text-brand-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-gold hover:underline">
            Login
          </Link>
        </p>

        {/* Link to farmer registration page */}
        <p className="text-center text-brand-muted text-sm mt-2">
          Are you a Farmer?{' '}
          <Link to="/register/farmer" className="text-brand-gold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterVisitorPage
