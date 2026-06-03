import { Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import ApiHorsesPage from './pages/ApiHorsesPage.tsx'

function App() {
  return (
    <>
      <nav className="bg-gray-900 text-white flex gap-6 px-8 py-3 text-sm font-bold">
        <Link to="/" className="hover:text-amber-400 transition">Local Data</Link>
        <Link to="/api/horses" className="hover:text-amber-400 transition">API Horses</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/api/horses" element={<ApiHorsesPage />} />
      </Routes>
    </>
  )
}

export default App
