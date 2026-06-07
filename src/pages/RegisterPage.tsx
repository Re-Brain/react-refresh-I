import { useNavigate } from 'react-router-dom'

function RegisterPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center">
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-brand-gold mb-2 text-center">Create Account</h1>
        <p className="text-brand-muted text-center mb-8">Who are you registering as?</p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/register/visitor')}
            className="w-full py-6 rounded-lg font-bold text-lg border border-brand-border bg-brand-bg text-brand-text hover:border-brand-gold hover:text-brand-gold transition"
          >
            Visitor
            <p className="text-sm font-normal text-brand-muted mt-1">Browse and explore horse listings</p>
          </button>
          <button
            onClick={() => navigate('/register/farmer')}
            className="w-full py-6 rounded-lg font-bold text-lg border border-brand-border bg-brand-bg text-brand-text hover:border-brand-gold hover:text-brand-gold transition"
          >
            Farmer
            <p className="text-sm font-normal text-brand-muted mt-1">List and manage your horses</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
