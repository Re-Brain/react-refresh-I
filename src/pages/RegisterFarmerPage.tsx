import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerFarmer, getMe } from '../api/auth'
import { useAuth } from '../context/useAuth'

function RegisterFarmerPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [farmName, setFarmName] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    try {
      const token = await registerFarmer(name, email, password, farmName)
      localStorage.setItem('access_token', token.access_token)
      const user = await getMe(token.access_token)
      setUser(user)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center">
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-brand-gold mb-1 text-center">Farmer Register</h1>
        <p className="text-brand-muted text-center mb-6">Create your farmer account</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-brand-muted">Farm Name</label>
            <input
              type="text"
              placeholder="Enter your farm name"
              value={farmName}
              onChange={e => setFarmName(e.target.value)}
              className="bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-brand-gold text-brand-bg font-bold py-2 rounded-lg hover:bg-brand-gold-light transition mt-2"
          >
            Create Account
          </button>
        </form>
        <p className="text-center text-brand-muted text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-gold hover:underline">
            Login
          </Link>
        </p>
        <p className="text-center text-brand-muted text-sm mt-2">
          Are you a visitor?{' '}
          <Link to="/register/visitor" className="text-brand-gold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterFarmerPage
