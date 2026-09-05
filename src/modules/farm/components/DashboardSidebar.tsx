import { Menu, Home, List, CalendarClock, Users, Heart, Settings, Lock } from 'lucide-react'

export type Section =
  | 'farm-info'
  | 'horse-management'
  | 'availability'
  | 'visitor-management'
  | 'donations'
  | 'settings'

// Sections that stay locked until the farm is approved (active) — they need
// a live, public farm to be useful, and their backend endpoints 403 until then.
export const gatedSections: Section[] = ['horse-management', 'availability', 'visitor-management', 'donations']

const navItems: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'farm-info', label: 'Farm Info', icon: <Home size={18} /> },
  { key: 'horse-management', label: 'Horse Management', icon: <List size={18} /> },
  { key: 'availability', label: 'Visit Availability', icon: <CalendarClock size={18} /> },
  { key: 'visitor-management', label: 'Visitor Management', icon: <Users size={18} /> },
  { key: 'donations', label: 'Donations', icon: <Heart size={18} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

type DashboardSidebarProps = {
  activeSection: Section
  onNavClick: (key: Section) => void
  open: boolean
  onToggle: () => void
  farmActive: boolean
}

// Collapsible left nav. Gated sections show a lock icon and are disabled until
// the farm is approved (active).
function DashboardSidebar({ activeSection, onNavClick, open, onToggle, farmActive }: DashboardSidebarProps) {
  return (
    // The outer <aside> is a plain (non-sticky) flex item, so the default
    // align-items: stretch fills it to the full row height (matching
    // <main>'s content) and its white background runs the whole column.
    // Sticky lives on the inner wrapper instead — sticky positioning on a
    // stretched flex item doesn't reliably stick in all browsers, so the nav
    // itself needs a non-stretched box to pin correctly within the tall
    // outer one.
    <aside className={`${open ? 'w-56' : 'w-14'} bg-brand-surface border-r border-brand-border transition-all duration-300`}>
      <div className="sticky top-16.25 flex flex-col">
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
            const locked = gatedSections.includes(item.key) && !farmActive
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
                title={locked ? 'Your farm must be approved to unlock this' : (!open ? item.label : undefined)}
              >
                {locked ? <Lock size={18} /> : item.icon}
                {open && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default DashboardSidebar
