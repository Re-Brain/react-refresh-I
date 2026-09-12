import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
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
  // Desktop keeps its long-standing "starts expanded" default; mobile starts
  // closed since the sidebar is a full-screen overlay drawer there (see
  // AdminDashboardSidebar) — matches the same fix on the other dashboards.
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)

  // Only admins belong here — bounce anyone else back to their own dashboard.
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard', { replace: true })
  }, [user, navigate])

  function handleNavClick(section: AdminSection) {
    sessionStorage.setItem('adminDashboardSection', section)
    setActiveSection(section)
    if (window.innerWidth < 1024) setSidebarOpen(false)
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

      {/* min-w-0 overrides a flex item's default min-width:auto — without it
          a wide descendant (e.g. a table's min-w) can stretch this whole
          flex item, and the page, instead of staying contained. */}
      <main className="flex-1 min-w-0 p-4 xs:p-6 sm:p-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden flex items-center gap-2 text-brand-muted hover:text-brand-gold font-bold text-sm mb-4 transition"
        >
          <Menu size={20} /> Menu
        </button>

        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-brand-gold">
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
