import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import AdminDashboardSidebar, { type AdminSection } from '../components/AdminDashboardSidebar'
import FarmApprovalsSection from '../components/FarmApprovalsSection'
import HorseApprovalsSection from '../components/HorseApprovalsSection'

function AdminDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  // Persisted so navigating away (e.g. to a horse's detail page) and back
  // returns to the same tab instead of resetting to Farm Approvals.
  const [activeSection, setActiveSection] = useState<AdminSection>(
    (sessionStorage.getItem('adminDashboardSection') as AdminSection) ?? 'farm-approvals'
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Only admins belong here — bounce anyone else back to their own dashboard.
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard', { replace: true })
  }, [user, navigate])

  function handleNavClick(section: AdminSection) {
    sessionStorage.setItem('adminDashboardSection', section)
    setActiveSection(section)
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex">
      <AdminDashboardSidebar
        activeSection={activeSection}
        onNavClick={handleNavClick}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-gold">
              {activeSection === 'farm-approvals' ? 'Farm Registrations Request' : 'Horse Registrations Request'}
            </h1>
            <p className="text-brand-muted text-sm mt-1">
              {activeSection === 'farm-approvals'
                ? 'Review and approve new farm registration requests.'
                : 'Review and approve horses farmers want to add to their farm.'}
            </p>
          </div>

          {activeSection === 'farm-approvals' ? <FarmApprovalsSection /> : <HorseApprovalsSection />}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboardPage
