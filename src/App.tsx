import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Lenis from 'lenis'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import RegisterVisitorPage from './pages/RegisterVisitorPage.tsx'
import RegisterFarmerPage from './pages/RegisterFarmerPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import FarmerDashboardPage from './pages/FarmerDashboardPage.tsx'
import VisitorDashboardPage from './pages/VisitorDashboardPage.tsx'
import AddHorsePage from './pages/AddHorsePage.tsx'
import HorseDetailPage from './pages/HorseDetailPage.tsx'
import HorsePublicPage from './pages/HorsePublicPage.tsx'
import HorsesListPage from './pages/HorsesListPage.tsx'
import FarmsListPage from './pages/FarmsListPage.tsx'
import FarmDetailPage from './pages/FarmDetailPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import { useAuth } from './context/useAuth'

// Shared styling for the big, uppercase headings inside the full-screen menu.
const menuItemClass =
  'block text-xl sm:text-2xl font-bold uppercase tracking-wide text-white/95 hover:text-amber-300 transition-colors'

function MenuItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className={menuItemClass}>
      {children}
    </Link>
  )
}

function MenuButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button onClick={onClick} className={`${menuItemClass} text-left`}>
      {children}
    </button>
  )
}

function App() {
  const { user, logout } = useAuth()
  const lenisRef = useRef<Lenis | null>(null)
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Smooth inertia scrolling: the page eases toward the target instead of
  // snapping, giving that gentle "glide" feel. Disabled for users who ask
  // for reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.08, // lower = more glide/delay; higher = snappier
      wheelMultiplier: 1,
    })
    lenisRef.current = lenis

    let rafId = requestAnimationFrame(function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    })

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Reset scroll to the top on every route change (React Router keeps the old
  // position by default). Go through Lenis so it doesn't fight the smooth scroll.
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
    // Collapse the hamburger menu whenever we navigate to a new page.
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <nav
        className={`sticky top-0 z-50 flex items-center justify-between gap-6 px-8 py-3 text-sm font-bold transition-colors duration-300 ${
          menuOpen
            ? 'bg-transparent text-white border-b border-transparent'
            : 'bg-brand-surface text-brand-text border-b border-brand-border'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-2xl font-extrabold tracking-tight hover:text-brand-gold transition"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 shrink-0"
              aria-hidden="true"
            >
              {/* Horseshoe: open U-shaped arc with nail holes */}
              <path d="M6 21c-2-1.5-3-4-3-7a9 9 0 0 1 18 0c0 3-1 5.5-3 7" />
              <circle cx="7" cy="12" r="0.6" fill="currentColor" stroke="none" />
              <circle cx="6" cy="16" r="0.6" fill="currentColor" stroke="none" />
              <circle cx="17" cy="12" r="0.6" fill="currentColor" stroke="none" />
              <circle cx="18" cy="16" r="0.6" fill="currentColor" stroke="none" />
            </svg>
            <span className="leading-none">Furlong</span>
          </Link>
        </div>
        <button
          onClick={() => setMenuOpen(open => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className={`flex items-center justify-center rounded p-1 transition ${
            menuOpen
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'hover:text-brand-gold'
          }`}
        >
          {menuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </nav>

      {/* Full-screen overlay menu (fades in beneath the sticky navbar) */}
      <div
        className={`fixed inset-0 z-40 overflow-y-auto bg-[#14261d] text-white transition-opacity duration-300 ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-16 gap-y-4 px-8 pt-28 pb-16 md:grid-cols-2">
          <MenuItem to="/">Home</MenuItem>
          <MenuItem to="/horses">Champions</MenuItem>
          <MenuItem to="/farms">Farms</MenuItem>
          {user ? (
            <>
              <MenuItem to="/dashboard">Dashboard</MenuItem>
              <MenuButton
                onClick={() => {
                  setMenuOpen(false)
                  logout()
                }}
              >
                Logout
              </MenuButton>
            </>
          ) : (
            <>
              <MenuItem to="/login">Login</MenuItem>
              <MenuItem to="/register">Register</MenuItem>
            </>
          )}
        </div>
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/horses" element={<HorsesListPage />} />
        <Route path="/farms" element={<FarmsListPage />} />
        <Route path="/farms/:id" element={<FarmDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/visitor" element={<RegisterVisitorPage />} />
        <Route path="/register/farmer" element={<RegisterFarmerPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/farmer" element={<ProtectedRoute><FarmerDashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/farmer/horses/new" element={<ProtectedRoute><AddHorsePage /></ProtectedRoute>} />
        <Route path="/dashboard/farmer/horses/:id" element={<ProtectedRoute><HorseDetailPage /></ProtectedRoute>} />
        <Route path="/horses/:id" element={<HorsePublicPage />} />
        <Route path="/dashboard/visitor" element={<ProtectedRoute><VisitorDashboardPage /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App
