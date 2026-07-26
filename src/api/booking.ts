import type { Period } from './availability'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled'

// A confirmed booking as returned by POST /bookings. `start`/`end` are the
// authoritative slot times the server resolved from the farm schedule — use
// these for display, not anything the client picked.
export type Booking = {
  id: number
  horse_id: number
  farm_id: number
  // Denormalized names for display, returned by both booking endpoints. Null if
  // the horse/farm was since deleted — always guard with a fallback.
  horse_name: string | null
  farm_name: string | null
  visitor_id: number
  visitor_name: string
  visitor_email: string
  date: string
  period: Period
  start: string
  end: string
  party_size: number
  note: string
  status: BookingStatus
  // Why the farmer declined/cancelled it, if they gave one. Null otherwise
  // (including for every non-declined/cancelled booking).
  reason: string | null
  created_at: string
}

// The visitor's-dashboard list uses the same shape.
export type VisitorBooking = Booking

// The visitor's identity comes from the token, so it isn't part of the body.
export type BookingCreate = {
  horse_id: number
  date: string // ISO "YYYY-MM-DD", today or later
  period: Period
  party_size: number
  note?: string
}

// Carries the HTTP status so the UI can branch (401 → login, 409 → not
// bookable / already booked, 422 → invalid input) with a message from `detail`.
export class BookingError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'BookingError'
    this.status = status
  }
}

// `detail` is a string for the business errors and an array of field errors for
// 422s — pull a readable message out of either shape.
function messageFromDetail(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') return detail[0].msg
  return fallback
}

function defaultMessage(status: number): string {
  switch (status) {
    case 401:
      return 'Please log in to book a visit.'
    case 404:
      return 'Horse not found.'
    case 409:
      return "This slot isn't available."
    case 422:
      return 'Please check your booking details.'
    default:
      return 'Failed to create booking.'
  }
}

// The farmer confirms, declines, or cancels a booking at their farm (the
// latter only valid on an already-confirmed visit). Owner-only on the server;
// returns the updated booking. `reason` is an optional note shown to the
// visitor — only meaningful alongside 'declined'/'cancelled'.
export async function updateBookingStatus(
  token: string,
  id: number,
  status: Extract<BookingStatus, 'confirmed' | 'declined' | 'cancelled'>,
  reason?: string
): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(reason ? { status, reason } : { status }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(body?.detail, 'Failed to update the booking.'))
  }
  return res.json()
}

// The visitor cancels their own booking. The server allows this only for the
// booking's own visitor; returns the updated booking.
export async function cancelBooking(token: string, id: number): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled' }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(body?.detail, 'Failed to cancel the booking.'))
  }
  return res.json()
}

// All bookings made at the logged-in farmer's farm, sorted soonest-first by the
// server. Optionally filtered to a single status.
export async function getFarmBookings(
  token: string,
  status?: BookingStatus
): Promise<Booking[]> {
  const query = status ? `?status=${status}` : ''
  const res = await fetch(`${API_BASE_URL}/farms/me/bookings${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to load bookings.')
  return res.json()
}

// The logged-in visitor's own bookings (identity resolved from the token).
export async function getMyBookings(token: string): Promise<VisitorBooking[]> {
  const res = await fetch(`${API_BASE_URL}/bookings/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to load your bookings.')
  return res.json()
}

export async function createBooking(token: string, data: BookingCreate): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new BookingError(res.status, messageFromDetail(body.detail, defaultMessage(res.status)))
  }
  return res.json()
}
