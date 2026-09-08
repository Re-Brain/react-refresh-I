import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// Keeps an already-logged-in visitor off login/register — reaching those
// while a session is still active is how someone ends up registering a
// second account without realizing their first session never went away, and
// finishing verification confused about which account is actually "in".
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default GuestRoute
