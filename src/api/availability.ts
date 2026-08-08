// Visit availability, in two levels:
//
//   • The FARM owns the schedule — which weekdays it's open, and for each period
//     of the day (morning/afternoon/evening) whether it's open plus a single
//     start/end time. Each period's time can be adjusted within a fixed window.
//
//   • Each HORSE just picks which periods it takes part in (morning/afternoon/
//     evening). A horse can't set its own times — it only opts into the farm's
//     open periods. Default: all three. None = not available.
//
// A visitor booking a horse sees the farm's times for the periods that horse
// participates in.
//
// Persistence lives on the backend: the farm schedule under /farms/me/availability
// and each horse's periods under /horses/{id}/periods. The public horse response
// also carries the farm's availability + the horse's periods, so the booking page
// needs no extra request. Weekdays use 0 = Sunday … 6 = Saturday.

import type { Horse } from './horse'

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export type Period = 'morning' | 'afternoon' | 'evening'
export const ALL_PERIODS: Period[] = ['morning', 'afternoon', 'evening']

export type PeriodDef = {
  key: Period
  label: string
  // The window the period's time must stay within, as 24h "HH:MM".
  window: { start: string; end: string }
}

export const PERIODS: PeriodDef[] = [
  { key: 'morning', label: 'Morning', window: { start: '08:00', end: '12:00' } },
  { key: 'afternoon', label: 'Afternoon', window: { start: '12:00', end: '16:00' } },
  { key: 'evening', label: 'Evening', window: { start: '16:00', end: '18:00' } },
]

// One period's schedule: whether it's open, and its single time range.
export type PeriodSchedule = { open: boolean; start: string; end: string }

// A bookable time range shown to visitors, as 24h "HH:MM".
export type Session = { start: string; end: string }

// ─── Farm schedule ──────────────────────────────────────────────────────────

export type FarmAvailability = {
  enabled: boolean // whether the farm accepts visit bookings at all
  weekdays: number[] // 0=Sun … 6=Sat — days visits are accepted
  periods: Record<Period, PeriodSchedule>
  min_lead_days: number // fewest days ahead a visit may be booked (0 = same day allowed)
}

// Sensible default for an unconfigured farm: open every day, mornings and
// afternoons on (each spanning its full window), evenings off, a week's notice.
export const DEFAULT_FARM_AVAILABILITY: FarmAvailability = {
  enabled: true,
  weekdays: [0, 1, 2, 3, 4, 5, 6],
  periods: {
    morning: { open: true, start: '08:00', end: '12:00' },
    afternoon: { open: true, start: '12:00', end: '16:00' },
    evening: { open: false, start: '16:00', end: '18:00' },
  },
  min_lead_days: 7,
}

// ─── Time helpers ───────────────────────────────────────────────────────────

// "09:30" → 570 (minutes since midnight).
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function fromMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// "13:00" → "1:00pm"
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const meridiem = h < 12 ? 'am' : 'pm'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')}${meridiem}`
}

// Every "HH:MM" from start to end (inclusive) at the given step, for building a
// dropdown that's limited to a period's window.
export function timeOptions(start: string, end: string, stepMin = 15): string[] {
  const out: string[] = []
  for (let m = toMinutes(start); m <= toMinutes(end); m += stepMin) out.push(fromMinutes(m))
  return out
}

// Validate one period's time range against its window. Returns an error message,
// or null if valid. Only meaningful for open periods.
export function validatePeriodSchedule(s: PeriodSchedule, def: PeriodDef): string | null {
  const start = toMinutes(s.start)
  const end = toMinutes(s.end)
  if (start >= end) return 'End time must be after the start time.'
  if (start < toMinutes(def.window.start) || end > toMinutes(def.window.end))
    return `Must be within ${formatTime(def.window.start)}–${formatTime(def.window.end)}.`
  return null
}

// The slots a visitor can pick when booking a given horse: the farm's time for
// each period that is both open and one the horse takes part in.
export type PeriodSlots = { period: PeriodDef; slots: Session[] }
export function getHorseVisitSlots(
  farm: FarmAvailability,
  horsePeriods: Period[]
): PeriodSlots[] {
  if (!farm.enabled) return []
  return PERIODS.filter(p => horsePeriods.includes(p.key) && farm.periods[p.key].open).map(p => ({
    period: p,
    slots: [{ start: farm.periods[p.key].start, end: farm.periods[p.key].end }],
  }))
}

// ─── Backend ────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

// The logged-in farmer's schedule. The backend returns the default (never a
// 404) when the farm has never configured it.
export async function getFarmAvailability(token: string): Promise<FarmAvailability> {
  const res = await fetch(`${API_BASE_URL}/farms/me/availability`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to load farm availability')
  return res.json()
}

// PUT replaces the whole object — always send all three periods and every
// field. Returns the saved schedule.
export async function saveFarmAvailability(
  token: string,
  value: FarmAvailability
): Promise<FarmAvailability> {
  const res = await fetch(`${API_BASE_URL}/farms/me/availability`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  })
  if (!res.ok) throw new Error('Failed to save farm availability')
  return res.json()
}

// The periods a horse takes part in ([] = not available for visits). The server
// dedupes and re-sorts to canonical order, so no need to sort here. Returns the
// full updated horse.
export async function saveHorsePeriods(
  token: string,
  horseId: number,
  periods: Period[]
): Promise<Horse> {
  const res = await fetch(`${API_BASE_URL}/horses/${horseId}/periods`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ periods }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Failed to save horse periods')
  }
  return res.json()
}
