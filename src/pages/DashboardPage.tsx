import { useAuth } from '../context/useAuth'

function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-8">
      <h1 className="text-3xl font-bold text-brand-gold">
        Welcome, {user?.role === 'farmer' ? 'Farmer' : 'Visitor'} {user?.name}
      </h1>
    </div>
  )
}

export default DashboardPage
