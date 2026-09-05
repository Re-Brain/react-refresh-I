import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Lenis from 'lenis'
import HomePage from './pages/HomePage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import VisitorDashboardPage from './pages/VisitorDashboardPage.tsx'
import Footer from './components/Footer.tsx'
import HorseshoeIcon from './components/HorseshoeIcon.tsx'
import { LenisContext } from './context/LenisContext'
import {
  useAuth,
  ProtectedRoute,
  LoginPage,
  RegisterPage,
  RegisterVisitorPage,
  RegisterFarmerPage,
  CheckEmailPage,
  VerifyEmailPage,
  ResetPasswordPage,
} from './modules/auth'
import {
  AdminDashboardPage,
  AdminFarmDetailPage,
  AdminHorseDetailPage,
} from './modules/admin'
import { BookVisitPage, BookingConfirmationPage } from './modules/booking'
import {
  FarmerDashboardPage,
  FarmDetailPage,
  FarmsListPage,
  HorseEditPage,
  HorseProfilePage,
  HorsesListPage,
  RequireActiveFarm,
} from './modules/farm'
import {
  DonateSuccessPage,
  DonateCancelPage,
  StripeReturnPage,
  StripeRefreshPage,
} from './modules/donation'

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
  const location = useLocation()
  const { pathname } = location
  const navigationType = useNavigationType()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  // True while we're actively re-asserting a restored scroll position (see
  // below) — the routed page is hidden during this window so the user never
  // sees the brief "lands in the wrong spot, then jumps" flash while async
  // content is still loading in underneath it.
  const [restoringScroll, setRestoringScroll] = useState(false)

  // Remember each history entry's scroll position as the user scrolls, so a
  // back/forward navigation can restore it below.
  const scrollPositions = useRef<Map<string, number>>(new Map())
  useEffect(() => {
    const key = location.key
    const onScroll = () => scrollPositions.current.set(key, window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.key])

  // Detecting "was this a back/forward navigation" turned out to need two
  // signals, neither reliable alone: React Router's useNavigationType() and
  // a raw window 'popstate' listener each missed it in different testing
  // environments. Neither ever fires for a <Link> click or navigate() call,
  // so trusting either one (an OR, not an AND) can't produce a false
  // positive — it just doubles our chances of catching a real one.
  const wasPopRef = useRef(false)
  useEffect(() => {
    const onPopState = () => {
      wasPopRef.current = true
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // We restore scroll position ourselves (below), so stop the browser from
  // fighting us with its own guess.
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
  }, [])

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

  // On a normal (link click / navigate()) navigation, jump to the top of the
  // new page. On a real back/forward navigation, restore the scroll position
  // the user left this page at. Runs before paint (useLayoutEffect) so the
  // very first application never flashes at the wrong spot first.
  useLayoutEffect(() => {
    setMenuOpen(false)

    const isPop = navigationType === 'POP' || wasPopRef.current
    wasPopRef.current = false

    const saved = scrollPositions.current.get(location.key)
    const target = isPop ? (saved ?? 0) : 0

    const applyScroll = () => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { immediate: true })
      } else {
        window.scrollTo(0, target)
      }
    }
    applyScroll()

    if (target === 0) return

    // Farm/horse lists (and similar) load asynchronously, so the page can
    // still be growing after we land on it — and Lenis has its own internal
    // resize handling that re-syncs to the current native scroll position
    // whenever the page's height changes, which can silently undo a single
    // restore attempt. So instead of reacting once, we keep re-asserting the
    // target every frame for up to a couple of seconds (stopping the moment
    // we've actually reached it), which wins that race regardless of what
    // knocked it off. The page stays hidden the whole time, so none of these
    // intermediate jumps are ever visible — checking every frame (rather
    // than e.g. every 100ms) means it reveals the instant it's ready instead
    // of sitting hidden longer than it needs to.
    setRestoringScroll(true)
    const start = Date.now()
    let rafId = requestAnimationFrame(function tick() {
      applyScroll()
      if (Math.abs(window.scrollY - target) < 4 || Date.now() - start > 2500) {
        setRestoringScroll(false)
      } else {
        rafId = requestAnimationFrame(tick)
      }
    })

    return () => {
      cancelAnimationFrame(rafId)
      setRestoringScroll(false)
    }
  }, [pathname, navigationType, location.key])

  return (
    <LenisContext.Provider value={lenisRef}>
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
            <HorseshoeIcon className="h-10 w-10 shrink-0" />
            <span className="leading-none">Furlong</span>
          </Link>
        </div>
        <button
          onClick={() => setMenuOpen((open) => !open)}
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
                  navigate('/')
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
      <div style={restoringScroll ? { visibility: 'hidden' } : undefined}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/horses" element={<HorsesListPage />} />
          <Route path="/farms" element={<FarmsListPage />} />
          <Route path="/farms/:id" element={<FarmDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/visitor" element={<RegisterVisitorPage />} />
          <Route path="/register/farmer" element={<RegisterFarmerPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/farmer"
            element={
              <ProtectedRoute>
                <FarmerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/farmer/horses/:id"
            element={
              <ProtectedRoute>
                <RequireActiveFarm>
                  <HorseEditPage />
                </RequireActiveFarm>
              </ProtectedRoute>
            }
          />
          <Route path="/horses/:id" element={<HorseProfilePage />} />
          <Route
            path="/book/:horseId"
            element={
              <ProtectedRoute>
                <BookVisitPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book/confirmation"
            element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/visitor"
            element={
              <ProtectedRoute>
                <VisitorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/farms/:id"
            element={
              <ProtectedRoute>
                <AdminFarmDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/horses/:id"
            element={
              <ProtectedRoute>
                <AdminHorseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/donate/success" element={<DonateSuccessPage />} />
          <Route path="/donate/cancel" element={<DonateCancelPage />} />
          <Route
            path="/farm/stripe/return"
            element={
              <ProtectedRoute>
                <RequireActiveFarm>
                  <StripeReturnPage />
                </RequireActiveFarm>
              </ProtectedRoute>
            }
          />
          <Route
            path="/farm/stripe/refresh"
            element={
              <ProtectedRoute>
                <RequireActiveFarm>
                  <StripeRefreshPage />
                </RequireActiveFarm>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </LenisContext.Provider>
  )
}

export default App
