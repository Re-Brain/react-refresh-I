import { useState } from 'react'
import { Menu, Home, List, Settings } from 'lucide-react'
import { useAuth } from '../context/useAuth'

type Section = 'farm-info' | 'horse-management' | 'settings'

const navItems: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'farm-info', label: 'Farm Info', icon: <Home size={18} /> },
  { key: 'horse-management', label: 'Horse Management', icon: <List size={18} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

function FarmerDashboardPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<Section>('farm-info')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex">
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-brand-surface border-r border-brand-border flex flex-col transition-all duration-300`}>
        <div className={`flex items-center ${sidebarOpen ? 'justify-between px-4' : 'justify-center'} py-4 border-b border-brand-border`}>
          {sidebarOpen && <p className="text-brand-muted text-xs font-bold uppercase">Dashboard</p>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-brand-muted hover:text-brand-gold transition"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-2 mt-2">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-sm transition ${
                activeSection === item.key
                  ? 'bg-brand-gold text-brand-bg'
                  : 'text-brand-muted hover:text-brand-gold hover:bg-brand-bg'
              } ${!sidebarOpen ? 'justify-center' : ''}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {activeSection === 'farm-info' && (
          <div>
            <h2 className="text-2xl font-bold text-brand-gold mb-6">Farm Info</h2>
            <div className="flex flex-col gap-6">
              <div className="flex gap-6">
                <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-6 flex-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-brand-muted uppercase">Farm Name</label>
                    <p className="text-brand-text font-bold text-lg">—</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-brand-muted uppercase">Description</label>
                    <p className="text-brand-text">—</p>
                  </div>
                  <button className="self-start bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm">
                    Edit Farm Info
                  </button>
                </div>

              </div>

              <div className="bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col gap-3">
                <label className="text-xs font-bold text-brand-muted uppercase">Location</label>
                <p className="text-brand-text">—</p>
                <iframe
                  src="https://maps.google.com/maps?q=Tokyo,Japan&output=embed"
                  className="w-full h-96 rounded-lg border border-brand-border"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}
        {activeSection === 'horse-management' && (
          <div>
            <h2 className="text-2xl font-bold text-brand-gold mb-6">Horse Management</h2>
            <p className="text-brand-muted">Horse listings will go here.</p>
          </div>
        )}
        {activeSection === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-brand-gold mb-6">Settings</h2>
            <p className="text-brand-muted">Change password and delete account will go here.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default FarmerDashboardPage
