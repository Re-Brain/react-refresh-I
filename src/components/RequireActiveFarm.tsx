import { Navigate } from 'react-router-dom'
import { useFarm } from '../context/useFarm'

// Guards routes that only make sense once the farm is approved — horse
// add/edit and Stripe onboarding. The sidebar already hides/disables these
// as nav targets, but this covers direct URL access (bookmarks, browser
// back/forward, or a status that flips mid-session), sending the farmer back
// to the dashboard instead of a dead-end form the backend will 403 on anyway.
function RequireActiveFarm({ children }: { children: React.ReactNode }) {
  const { loading, farmActive } = useFarm()

  if (loading) return null
  if (!farmActive) {
    sessionStorage.setItem('dashboardSection', 'farm-info')
    return <Navigate to="/dashboard/farmer" replace />
  }
  return <>{children}</>
}

export default RequireActiveFarm
