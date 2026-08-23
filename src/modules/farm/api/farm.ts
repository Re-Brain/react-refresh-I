import { API_BASE_URL } from '../../../lib/apiBase'
import { apiFetch } from '../../../lib/apiFetch'

export type FarmImage = {
  id: number
  image_url: string
  position: number
}

export const FARM_IMAGE_LIMIT = 3

// Proof-of-legitimacy documents required before a farm can be submitted for review.
export type FarmDocumentType = 'business_registration' | 'insurance' | 'facility_license'

export const FARM_DOCUMENT_TYPES: { key: FarmDocumentType; label: string }[] = [
  { key: 'business_registration', label: 'Business Registration / Farm License' },
  { key: 'insurance', label: 'Liability Insurance Certificate' },
  { key: 'facility_license', label: 'Facility / Animal Care License' },
]

export type FarmDocument = {
  id: number
  document_type: FarmDocumentType
  file_url: string
  original_filename: string
  uploaded_at: string
}

export type Farm = {
  id: number
  name: string
  location: string | null
  description: string | null
  capacity: number | null
  status: 'draft' | 'pending' | 'active' | 'rejected'
  rejection_reason: string | null
  images: FarmImage[]
  // Only present on the owner's/admin's view (GET /farms/me, GET /admin/farms) —
  // public farm endpoints never send this.
  documents?: FarmDocument[]
}

// Shape returned by the public GET /farms endpoint (always active, no auth).
export type ActiveFarm = {
  id: number
  name: string
  location: string | null
  description: string | null
  capacity: number | null
  status: string
  owner_id: number
  images: FarmImage[]
  // Whether this farm has finished Stripe Connect onboarding and can accept
  // donations. Undefined/false both mean "not ready" — the donate UI treats
  // them the same way.
  payouts_enabled?: boolean
}

// `detail` is a plain string for our own business-rule errors (e.g. "farm is
// pending review"), but FastAPI's own validation 422s send an array of field
// errors instead — pull a readable message out of either shape rather than
// letting `new Error(arrayOrObject)` stringify to "[object Object]".
function messageFromDetail(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') return detail[0].msg
  return fallback
}

// Cached for the browser session so re-visiting the home/farms list page
// (e.g. via the back button) renders instantly with the same data instead of
// re-fetching and showing a loading state every time.
let activeFarmsCache: ActiveFarm[] | null = null

// Return all active farms, or throw an error if the request fails. This is
// used on the home page to show a carousel of farms. Public/no-auth, so this
// goes straight through fetch rather than apiFetch — there's never a session
// to refresh here.
export async function getActiveFarms(): Promise<ActiveFarm[]> {
  if (activeFarmsCache) return activeFarmsCache
  const res = await fetch(`${API_BASE_URL}/farms`)
  if (!res.ok) throw new Error('Failed to fetch farms')
  const farms = await res.json()
  activeFarmsCache = farms
  return farms
}

// Returns the farm, or null when the backend responds 404 (no such farm).
export async function getFarm(id: number | string): Promise<ActiveFarm | null> {
  const res = await fetch(`${API_BASE_URL}/farms/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch farm')
  return res.json()
}

export type FarmUpdate = {
  name?: string
  location?: string | null
  description?: string | null
}

export function isFarmComplete(farm: Farm): boolean {
  return Boolean(farm.location && farm.description)
}

export async function getMyFarm(): Promise<Farm> {
  const res = await apiFetch('/farms/me')
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to fetch farm'))
  }
  return res.json()
}

export async function updateMyFarm(data: FarmUpdate): Promise<Farm> {
  const res = await apiFetch('/farms/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to update farm'))
  }
  return res.json()
}

// Image endpoints are scoped to the caller's own farm ("me"), mirroring the
// horse image endpoints. Each returns the updated farm with its images array.
export async function uploadFarmImage(file: File): Promise<Farm> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiFetch('/farms/me/image', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Failed to upload image')
  }
  return res.json()
}

export async function deleteFarmImage(imageId: number): Promise<Farm> {
  const res = await apiFetch(`/farms/me/image/${imageId}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to delete image'))
  }
  return res.json()
}

export async function reorderFarmImages(imageIds: number[]): Promise<Farm> {
  const res = await apiFetch('/farms/me/images/order', {
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

// Document endpoints mirror the horse document endpoints, scoped to the
// caller's own farm ("me"). Each returns the updated farm with its documents array.
export async function uploadFarmDocument(file: File, documentType: FarmDocumentType): Promise<Farm> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('document_type', documentType)
  const res = await apiFetch('/farms/me/documents', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to upload document'))
  }
  return res.json()
}

export async function deleteFarmDocument(documentId: number): Promise<Farm> {
  const res = await apiFetch(`/farms/me/documents/${documentId}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to delete document'))
  }
  return res.json()
}

// Moves the farm from draft/rejected to pending once the profile is complete
// and all 3 documents are present. Missing requirements should block the
// button client-side; this is the fallback for whatever slips through.
export async function submitFarmForReview(): Promise<Farm> {
  const res = await apiFetch('/farms/me/submit', { method: 'POST' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to submit farm for review'))
  }
  return res.json()
}
