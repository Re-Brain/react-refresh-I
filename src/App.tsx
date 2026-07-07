import { useEffect, useRef } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
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
import FarmDetailPage from './pages/FarmDetailPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import { useAuth } from './context/useAuth'

function App() {
  const { user, logout } = useAuth()
  const lenisRef = useRef<Lenis | null>(null)
  const { pathname } = useLocation()

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
  }, [pathname])

  return (
    <>
      <nav className="bg-brand-surface text-brand-text flex items-center justify-between gap-6 px-8 py-3 text-sm font-bold border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link to="/" className="hover:text-brand-gold transition">Home</Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-brand-gold transition">Dashboard</Link>
              <button
                onClick={logout}
                className="bg-brand-gold text-brand-bg px-4 py-1 rounded hover:bg-brand-gold-light transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-brand-gold transition">Login</Link>
              <Link to="/register" className="bg-brand-gold text-brand-bg px-4 py-1 rounded hover:bg-brand-gold-light transition">Register</Link>
            </>
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
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
