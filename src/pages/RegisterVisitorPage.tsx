import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerVisitor } from '../api/auth'

function RegisterVisitorPage() {

  // Get the navigate function from react-router-dom to programmatically navigate after successful registration
  const navigate = useNavigate()

  // State for name, email, password, and error message
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

   // Handle form submission for visitor registration
  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    try {

      // Register the visitor, then send them to the "check your email" screen
      // since the account isn't usable until the verification link is clicked.
      await registerVisitor(name, email, password)
      navigate('/check-email', { state: { email } })
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center">
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 w-full max-w-md">
        
        {/* Page title */}
        <h1 className="text-3xl font-bold text-brand-gold mb-1 text-center">Visitor Register</h1>
        
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
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition"
            />
          </div>

          {/* Display error message if registration fails */}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          
          {/* Submit button for registration */}
          <button
            type="submit"
            className="bg-brand-gold text-brand-bg font-bold py-2 rounded-lg hover:bg-brand-gold-light transition mt-2"
          >
            Create Account
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
