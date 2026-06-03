import { useState } from 'react'

function RegisterPage() {
  const [role, setRole] = useState<'visitor' | 'farmer'>('visitor')

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center">
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-brand-gold mb-6 text-center">Register</h1>
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-brand-muted">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-brand-muted">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-brand-muted">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-brand-muted">I am a...</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole('visitor')}
                className={`flex-1 py-2 rounded-lg font-bold border transition ${
                  role === 'visitor'
                    ? 'bg-brand-gold text-brand-bg border-brand-gold'
                    : 'bg-brand-bg text-brand-muted border-brand-border hover:border-brand-gold hover:text-brand-gold'
                }`}
              >
                Visitor
              </button>
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`flex-1 py-2 rounded-lg font-bold border transition ${
                  role === 'farmer'
                    ? 'bg-brand-gold text-brand-bg border-brand-gold'
                    : 'bg-brand-bg text-brand-muted border-brand-border hover:border-brand-gold hover:text-brand-gold'
                }`}
              >
                Farmer
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="bg-brand-gold text-brand-bg font-bold py-2 rounded-lg hover:bg-brand-gold-light transition mt-2"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
