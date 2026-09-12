import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useAuth } from '../modules/auth'
import VisitorDashboardSidebar, { type VisitorSection } from '../components/VisitorDashboardSidebar'
import { BookingsSection } from '../modules/booking'
import { SubscriptionSection } from '../modules/donation'
import SettingsSection from '../components/SettingsSection'
import { useAccountSettings } from '../hooks/useAccountSettings'

function VisitorDashboardPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<VisitorSection>('bookings')
  // Desktop keeps its long-standing "starts expanded" default; mobile starts
  // closed since the sidebar is a full-screen overlay drawer there (see
  // VisitorDashboardSidebar) — matches the same fix on the farmer dashboard.
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)
  const settings = useAccountSettings()

  function handleNavClick(key: VisitorSection) {
    setActiveSection(key)
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex">
      <VisitorDashboardSidebar
        activeSection={activeSection}
        onNavClick={handleNavClick}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* min-w-0 overrides a flex item's default min-width:auto — without it
          a wide descendant can stretch this whole flex item (and the page)
          instead of staying contained so its own overflow-x-auto can work. */}
      <main className="flex-1 min-w-0 p-4 xs:p-6 sm:p-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden flex items-center gap-2 text-brand-muted hover:text-brand-gold font-bold text-sm mb-4 transition"
        >
          <Menu size={20} /> Menu
        </button>

        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Page header */}
          <div>
            <h1 className="text-2xl xs:text-3xl font-bold text-brand-gold">Welcome, {user?.name}</h1>
            <p className="text-brand-muted text-sm mt-1">Manage your visits and subscription</p>
          </div>

          {activeSection === 'bookings' && <BookingsSection />}
          {activeSection === 'subscription' && <SubscriptionSection userName={user?.name} />}
          {activeSection === 'settings' && <SettingsSection settings={settings} />}
        </div>
      </main>
    </div>
  )
}

export default VisitorDashboardPage
