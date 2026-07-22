import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarClock } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { getMyBookings, cancelBooking, type VisitorBooking } from '../api/booking'
import BookingCard from '../components/BookingCard'

function VisitorDashboardPage() {

  // Get the authenticated user from the useAuth context
  const { user } = useAuth()

  // State for bookings, loading status, error messages
  const [bookings, setBookings] = useState<VisitorBooking[]>([])
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('access_token')))
  const [error, setError] = useState<string | null>(null)

  // State for confirming cancellation of a booking
  const [confirmId, setConfirmId] = useState<number | null>(null)
  
  // State for tracking which booking is currently being cancelled
  const [busyId, setBusyId] = useState<number | null>(null)

 // State for tracking any errors that occur during booking actions (like cancellation)
  const [actionError, setActionError] = useState<string | null>(null)

  // Function to fetch the user's bookings from the API
  function fetchBookings(token: string) {
    getMyBookings(token)
      .then(setBookings)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load your bookings.'))
      .finally(() => setLoading(false))
  }
  
  // Function to cancel a booking by its ID
  async function cancel(id: number) {
  
    // Get the access token from localStorage to authenticate the cancellation request
    const token = localStorage.getItem('access_token')

    // If there's no token, we can't proceed with the cancellation
    if (!token) return

    // Set the busyId to the ID of the booking being cancelled and clear any previous action errors
    setBusyId(id)

    // Clear any previous action errors before attempting to cancel the booking
    setActionError(null)

    try {

      // Call the cancelBooking API function to cancel the booking and get the updated booking data
      const updated = await cancelBooking(token, id)
      
      // Update the bookings state with the updated booking data, replacing the old booking with the new one
      setBookings(prev => prev.map(b => (b.id === updated.id ? updated : b)))
      
      // Clear the confirmId state to hide the confirmation prompt after successful cancellation
      setConfirmId(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel the booking.')
    } finally {
      setBusyId(null)
    }
  }

  // Fetch the user's bookings when the component mounts, if there's an access token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    fetchBookings(token)
  }, [])

  // Function to retry fetching bookings in case of an error
  function handleRetry() {
    const token = localStorage.getItem('access_token')
    if (!token) return
    setLoading(true)
    setError(null)
    fetchBookings(token)
  }

  // Soonest visit first.
  const sorted = [...bookings].sort(
    (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start)
  )

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-brand-gold">Welcome, {user?.name}</h1>
          <p className="text-brand-muted text-sm mt-1">Your visit bookings</p>
        </div>

        {/* Booking List Section */}
        {loading ? (
          // Loading state while the bookings are being fetched
          <p className="text-brand-muted text-sm">Loading…</p>
        ) : error ? (

          // Error state if there was an issue fetching the bookings
          <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
            
            {/* Error message and retry button */}
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>

            {/* Retry button to attempt fetching bookings again */}
            <button
              onClick={handleRetry}
              className="bg-red-500/10 text-red-600 border border-red-500/40 font-bold px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-sm shrink-0"
            >
              Retry
            </button>
          </div>
        ) : sorted.length === 0 ? (

          // State when the user has no bookings
          <div className="bg-brand-surface border border-brand-border rounded-lg p-8 text-center flex flex-col items-center gap-3">
            <CalendarClock size={28} className="text-brand-muted" />
            <p className="text-brand-muted text-sm">You haven&rsquo;t booked any visits yet.</p>
            <Link
              to="/horses"
              className="bg-brand-gold text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-gold-light transition text-sm"
            >
              Browse horses
            </Link>
          </div>
        ) : (

          // Display the list of bookings if there are any
          <div className="flex flex-col gap-4">

            {/* Action error message */}
            {actionError && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
                <AlertTriangle size={18} className="shrink-0" />
                <p>{actionError}</p>
              </div>
            )}

            {/* Grid of bookings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
              {sorted.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  confirming={confirmId === b.id}
                  busy={busyId === b.id}
                  onRequestCancel={() => {
                    setConfirmId(b.id)
                    setActionError(null)
                  }}
                  onConfirmCancel={() => cancel(b.id)}
                  onKeepCancel={() => setConfirmId(null)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VisitorDashboardPage
