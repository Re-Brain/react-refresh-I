import type { Period, FarmAvailability } from './availability'
import { API_BASE_URL } from '../../../lib/apiBase'
import { apiFetch } from '../../../lib/apiFetch'

export type HorseImage = {
  id: number
  image_url: string
  position: number
}

export type RaceRecord = {
  id: number
  race_date: string
  course: string
  race_name: string
  grade: string
  finish_position: number | null
  track: string
  distance: number
  condition: string
  horse_id: number
}

export type RaceRecordUpdate = Partial<Omit<RaceRecord, 'id' | 'horse_id'>>
export type RaceRecordCreate = Omit<RaceRecord, 'id' | 'horse_id' | 'grade'> & { grade?: string | null }

// Proof-of-existence documents required before a horse can be approved.
export type DocumentType = 'passport' | 'registration' | 'ownership_transfer'

export const DOCUMENT_TYPES: { key: DocumentType; label: string }[] = [
  { key: 'passport', label: 'Equine Passport' },
  { key: 'registration', label: 'Registration & Pedigree Papers' },
  { key: 'ownership_transfer', label: 'Ownership / Retirement Transfer' },
]

export type HorseDocument = {
  id: number
  document_type: DocumentType
  file_url: string
  original_filename: string
  uploaded_at: string
}

export type Horse = {
  id: number
  name: string
  story: string | null
  date_of_birth: string | null
  color: string | null
  gender: 'colt' | 'stallion' | 'gelding' | 'filly' | 'mare' | null
  sire: string | null
  dam: string | null
  sires_sire: string | null
  sires_dam: string | null
  dams_sire: string | null
  dams_dam: string | null
  farm_id: number | null
  farm_name?: string | null
  images: HorseImage[]
  race_records: RaceRecord[]
  // Capacity per period — how many visitors can book that period at once.
  // 0 (or missing) means the horse isn't offered in that period.
  periods: Record<Period, number>
  farm_availability: FarmAvailability
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  // Only present on the owner's/admin's view (GET /horses/me, GET /admin/horses) —
  // public horse endpoints never send this.
  documents?: HorseDocument[]
}

// The read-only availability/status/document fields aren't part of the create/update payload.
export type HorseCreate = Omit<Horse, 'id' | 'images' | 'farm_id' | 'farm_name' | 'periods' | 'farm_availability' | 'status' | 'rejection_reason' | 'documents'>
export type HorseUpdate = Partial<HorseCreate>

// `detail` is a plain string for our own business-rule errors (e.g. "missing
// documents"), but FastAPI's own validation 422s send an array of field
// errors instead — pull a readable message out of either shape rather than
// letting `new Error(arrayOrObject)` stringify to "[object Object]".
function messageFromDetail(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') return detail[0].msg
  return fallback
}

export async function getHorse(id: number): Promise<Horse> {
  const res = await apiFetch(`/horses/${id}`)
  if (!res.ok) throw new Error('Failed to fetch horse')
  return res.json()
}

// Cached for the browser session so re-visiting the home/horses list page
// (e.g. via the back button) renders instantly with the same data instead of
// re-fetching and showing a loading state every time.
let allHorsesCache: Horse[] | null = null

// Return all horses, or throw an error if the request fails. This is used on
// the home page to show a carousel of horses. Public/no-auth.
export async function getAllHorses(): Promise<Horse[]> {
  if (allHorsesCache) return allHorsesCache
  const res = await fetch(`${API_BASE_URL}/horses`)
  if (!res.ok) throw new Error('Failed to fetch horses')
  const horses = await res.json()
  allHorsesCache = horses
  return horses
}

export async function getHorsePublic(id: number): Promise<Horse> {
  const res = await fetch(`${API_BASE_URL}/horses/${id}`)
  if (!res.ok) throw new Error('Horse not found')
  return res.json()
}

export async function getMyHorses(): Promise<Horse[]> {
  const res = await apiFetch('/horses/me')
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to fetch horses'))
  }
  return res.json()
}

export async function createHorse(data: HorseCreate): Promise<Horse> {
  const res = await apiFetch('/horses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to create horse'))
  }
  return res.json()
}

export async function updateHorse(id: number, data: HorseUpdate): Promise<Horse> {
  const res = await apiFetch(`/horses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to update horse'))
  }
  return res.json()
}

export async function submitHorseForReview(horseId: number): Promise<Horse> {
  const res = await apiFetch(`/horses/${horseId}/submit`, { method: 'POST' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to submit horse for review'))
  }
  return res.json()
}

export async function deleteHorse(id: number): Promise<void> {
  const res = await apiFetch(`/horses/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to delete horse'))
  }
}

export async function uploadHorseImage(horseId: number, file: File): Promise<Horse> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiFetch(`/horses/${horseId}/image`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to upload image'))
  }
  return res.json()
}

export async function uploadHorseDocument(
  horseId: number,
  file: File,
  documentType: DocumentType
): Promise<Horse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('document_type', documentType)
  const res = await apiFetch(`/horses/${horseId}/documents`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to upload document'))
  }
  return res.json()
}

export async function deleteHorseDocument(horseId: number, documentId: number): Promise<Horse> {
  const res = await apiFetch(`/horses/${horseId}/documents/${documentId}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to delete document'))
  }
  return res.json()
}

export async function createRaceRecord(horseId: number, data: RaceRecordCreate): Promise<Horse> {
  const res = await apiFetch(`/horses/${horseId}/race-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to create race record'))
  }
  return res.json()
}

export async function deleteRaceRecord(horseId: number, recordId: number): Promise<Horse> {
  const res = await apiFetch(`/horses/${horseId}/race-records/${recordId}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to delete race record'))
  }
  return res.json()
}

export async function updateRaceRecord(horseId: number, recordId: number, data: RaceRecordUpdate): Promise<RaceRecord> {
  const res = await apiFetch(`/horses/${horseId}/race-records/${recordId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to update race record'))
  }
  return res.json()
}

export async function reorderHorseImages(horseId: number, imageIds: number[]): Promise<Horse> {
  const res = await apiFetch(`/horses/${horseId}/images/order`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_ids: imageIds }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to reorder images'))
  }
  return res.json()
}

export async function deleteHorseImage(horseId: number, imageId: number): Promise<Horse> {
  const res = await apiFetch(`/horses/${horseId}/image/${imageId}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to delete image'))
  }
  return res.json()
}
