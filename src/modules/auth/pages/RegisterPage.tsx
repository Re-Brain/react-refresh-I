import { Link, useNavigate } from 'react-router-dom'

function RegisterPage() {

  // Get the navigate function from react-router-dom to programmatically navigate after selecting a registration type
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-3.25rem)] bg-brand-bg text-brand-text flex items-center justify-center">
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 w-full max-w-md">
        
        {/* Page title */}
        <h1 className="text-3xl font-bold text-brand-gold mb-2 text-center">Create Account</h1>
        
        {/* Page subtitle */}
        <p className="text-brand-muted text-center mb-8">Who are you registering as?</p>
        
        {/* Registration type buttons */}
        <div className="flex flex-col gap-4">
          
          {/* Visitor registration button */}
          <button
            onClick={() => navigate('/register/visitor')}
            className="w-full py-6 rounded-lg font-bold text-lg border border-brand-border bg-brand-bg text-brand-text hover:border-brand-gold hover:text-brand-gold transition"
          >
            Visitor
            <p className="text-sm font-normal text-brand-muted mt-1">Browse and explore horse listings</p>
          </button>
          
          {/* Farmer registration button */}
          <button
            onClick={() => navigate('/register/farmer')}
            className="w-full py-6 rounded-lg font-bold text-lg border border-brand-border bg-brand-bg text-brand-text hover:border-brand-gold hover:text-brand-gold transition"
          >
            Farmer
            <p className="text-sm font-normal text-brand-muted mt-1">List and manage your horses</p>
          </button>

        </div>

        {/* Link to login page */}
        <p className="text-center text-brand-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-gold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
