import { Menu, CalendarCheck, CreditCard, Settings } from 'lucide-react'

export type VisitorSection = 'bookings' | 'subscription' | 'settings'

const NAV_ITEMS: { key: VisitorSection; label: string; icon: React.ReactNode }[] = [
  { key: 'bookings', label: 'Bookings', icon: <CalendarCheck size={18} /> },
  { key: 'subscription', label: 'Subscription', icon: <CreditCard size={18} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

type VisitorDashboardSidebarProps = {
  activeSection: VisitorSection
  onNavClick: (key: VisitorSection) => void
  open: boolean
  onToggle: () => void
}

// Collapsible left nav for the visitor dashboard, styled like the farmer's.
// Switches the main area between the Bookings, Subscription, and Settings sections.
function VisitorDashboardSidebar({ activeSection, onNavClick, open, onToggle }: VisitorDashboardSidebarProps) {
  return (
    <aside className={`${open ? 'w-56' : 'w-14'} shrink-0 bg-brand-surface border-r border-brand-border flex flex-col transition-all duration-300`}>
      <div className={`flex items-center ${open ? 'justify-between px-4' : 'justify-center'} py-4 border-b border-brand-border`}>
        {open && <p className="text-brand-muted text-xs font-bold uppercase">Dashboard</p>}
        <button onClick={onToggle} className="text-brand-muted hover:text-brand-gold transition">
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-2 mt-2">
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => onNavClick(item.key)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-sm transition ${
              activeSection === item.key
                ? 'bg-brand-gold text-brand-bg'
                : 'text-brand-muted hover:text-brand-gold hover:bg-brand-bg'
            } ${!open ? 'justify-center' : ''}`}
            title={!open ? item.label : undefined}
          >
            {item.icon}
            {open && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default VisitorDashboardSidebar
