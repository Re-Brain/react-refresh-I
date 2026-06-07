import { Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import ApiHorsesPage from './pages/ApiHorsesPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import RegisterVisitorPage from './pages/RegisterVisitorPage.tsx'
import RegisterFarmerPage from './pages/RegisterFarmerPage.tsx'

function App() {
  return (
    <>
      <nav className="bg-brand-surface text-brand-text flex items-center justify-between gap-6 px-8 py-3 text-sm font-bold border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link to="/" className="hover:text-brand-gold transition">Local Data</Link>
          <Link to="/api/horses" className="hover:text-brand-gold transition">API Horses</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hover:text-brand-gold transition">Login</Link>
          <Link to="/register" className="bg-brand-gold text-brand-bg px-4 py-1 rounded hover:bg-brand-gold-light transition">Register</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/api/horses" element={<ApiHorsesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/visitor" element={<RegisterVisitorPage />} />
        <Route path="/register/farmer" element={<RegisterFarmerPage />} />
      </Routes>
    </>
  )
}

export default App
