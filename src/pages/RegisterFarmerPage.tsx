import { Link } from 'react-router-dom'

function RegisterFarmerPage() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center">
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-brand-gold mb-1 text-center">Farmer Register</h1>
        <p className="text-brand-muted text-center mb-6">Create your farmer account</p>
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
            <label className="text-sm font-bold text-brand-muted">Farm Name</label>
            <input
              type="text"
              placeholder="Enter your farm name"
              className="bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold transition"
            />
          </div>
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
