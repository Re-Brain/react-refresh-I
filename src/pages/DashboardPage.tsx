import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'farmer') navigate('/dashboard/farmer', { replace: true })
    else if (user?.role === 'visitor') navigate('/dashboard/visitor', { replace: true })
  }, [user, navigate])

  return null
}

export default DashboardPage
