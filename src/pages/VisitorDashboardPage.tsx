import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import VisitorDashboardSidebar, { type VisitorSection } from '../components/VisitorDashboardSidebar'
import BookingsSection from '../components/BookingsSection'
import SubscriptionSection from '../components/SubscriptionSection'

function VisitorDashboardPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<VisitorSection>('bookings')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex">
      <VisitorDashboardSidebar
        activeSection={activeSection}
        onNavClick={setActiveSection}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Page header */}
          <div>
            <h1 className="text-3xl font-bold text-brand-gold">Welcome, {user?.name}</h1>
            <p className="text-brand-muted text-sm mt-1">Manage your visits and subscription</p>
          </div>

          {activeSection === 'bookings' && <BookingsSection />}
          {activeSection === 'subscription' && <SubscriptionSection userName={user?.name} />}
        </div>
      </main>
    </div>
  )
}

export default VisitorDashboardPage
