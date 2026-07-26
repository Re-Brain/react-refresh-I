import { Menu, Home, List, CalendarClock, Users, Settings, Lock } from 'lucide-react'

export type Section = 'farm-info' | 'horse-management' | 'availability' | 'visitor-management' | 'settings'

// Sections that stay locked until the farm profile is complete (they need
// horses / a live farm to be useful).
export const gatedSections: Section[] = ['horse-management', 'availability', 'visitor-management']

const navItems: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'farm-info', label: 'Farm Info', icon: <Home size={18} /> },
  { key: 'horse-management', label: 'Horse Management', icon: <List size={18} /> },
  { key: 'availability', label: 'Visit Availability', icon: <CalendarClock size={18} /> },
  { key: 'visitor-management', label: 'Visitor Management', icon: <Users size={18} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

type DashboardSidebarProps = {
  activeSection: Section
  onNavClick: (key: Section) => void
  open: boolean
  onToggle: () => void
  profileComplete: boolean
}

// Collapsible left nav. Gated sections show a lock icon and are disabled until
// the farm profile is complete.
function DashboardSidebar({ activeSection, onNavClick, open, onToggle, profileComplete }: DashboardSidebarProps) {
  return (
    <aside className={`${open ? 'w-56' : 'w-14'} bg-brand-surface border-r border-brand-border flex flex-col transition-all duration-300`}>
      <div className={`flex items-center ${open ? 'justify-between px-4' : 'justify-center'} py-4 border-b border-brand-border`}>
        {open && <p className="text-brand-muted text-xs font-bold uppercase">Dashboard</p>}
        <button
          onClick={onToggle}
          className="text-brand-muted hover:text-brand-gold transition"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-2 mt-2">
        {navItems.map(item => {
          const locked = gatedSections.includes(item.key) && !profileComplete
          return (
            <button
              key={item.key}
              onClick={() => onNavClick(item.key)}
              disabled={locked}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-sm transition ${
                locked
                  ? 'text-brand-muted opacity-40 cursor-not-allowed'
                  : activeSection === item.key
                  ? 'bg-brand-gold text-brand-bg'
                  : 'text-brand-muted hover:text-brand-gold hover:bg-brand-bg'
              } ${!open ? 'justify-center' : ''}`}
              title={locked ? 'Complete your farm profile to unlock' : (!open ? item.label : undefined)}
            >
              {locked ? <Lock size={18} /> : item.icon}
              {open && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default DashboardSidebar
