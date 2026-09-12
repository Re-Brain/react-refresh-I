import { Menu, Home, ListChecks } from 'lucide-react'

export type AdminSection = 'farm-approvals' | 'horse-approvals'

const NAV_ITEMS: { key: AdminSection; label: string; icon: React.ReactNode }[] = [
  { key: 'farm-approvals', label: 'Farm Approvals', icon: <Home size={18} /> },
  { key: 'horse-approvals', label: 'Horse Approvals', icon: <ListChecks size={18} /> },
]

type AdminDashboardSidebarProps = {
  activeSection: AdminSection
  onNavClick: (key: AdminSection) => void
  open: boolean
  onToggle: () => void
}

// Collapsible left nav for the admin dashboard, styled like the farmer/visitor
// ones. Below lg it's a fixed overlay drawer (with a backdrop) that slides
// in/out with `open`; at lg and up it's the original static column with the
// icon-rail collapse behaviour, unchanged.
function AdminDashboardSidebar({ activeSection, onNavClick, open, onToggle }: AdminDashboardSidebarProps) {
  return (
    <>
      {open && (
        <div
          onClick={onToggle}
          aria-hidden
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:translate-x-0 lg:z-auto lg:transition-[width] lg:shrink-0 ${
          open ? 'lg:w-56' : 'lg:w-14'
        } bg-brand-surface border-r border-brand-border flex flex-col h-full overflow-y-auto lg:h-auto lg:overflow-visible`}
      >
        <div className={`flex items-center ${open ? 'justify-between px-4' : 'justify-center'} py-4 border-b border-brand-border`}>
          {open && <p className="text-brand-muted text-xs font-bold uppercase">Admin</p>}
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
    </>
  )
}

export default AdminDashboardSidebar
