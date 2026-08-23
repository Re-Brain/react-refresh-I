import { Link } from 'react-router-dom'
import { useAuth } from '../modules/auth'
import HorseshoeIcon from './HorseshoeIcon'

function Footer() {
  const { user } = useAuth()

  return (
    <footer className="bg-[#14261d] text-white/90">
      <div className="max-w-7xl mx-auto px-8 py-14 grid grid-cols-1 sm:grid-cols-4 gap-10">
        <div className="sm:col-span-2 flex flex-col gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white hover:text-brand-gold transition w-fit"
          >
            <HorseshoeIcon className="h-8 w-8 shrink-0" />
            <span className="leading-none">Furlong</span>
          </Link>
          <p className="text-sm text-white/70 max-w-sm leading-relaxed">
            Furlong connects you with the farms caring for retired racehorses — browse who's
            nearby, book a visit, or donate to support their day-to-day care.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-brand-gold">Explore</h3>
          <Link to="/" className="text-sm text-white/70 hover:text-white transition w-fit">Home</Link>
          <Link to="/horses" className="text-sm text-white/70 hover:text-white transition w-fit">Champions</Link>
          <Link to="/farms" className="text-sm text-white/70 hover:text-white transition w-fit">Farms</Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-brand-gold">Account</h3>
          {user ? (
            <Link to="/dashboard" className="text-sm text-white/70 hover:text-white transition w-fit">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/70 hover:text-white transition w-fit">Login</Link>
              <Link to="/register" className="text-sm text-white/70 hover:text-white transition w-fit">Register</Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6 text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Furlong. All rights reserved.</span>
          <span>Life Beyond the Track</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
