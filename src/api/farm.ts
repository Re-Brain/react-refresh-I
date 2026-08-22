const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

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

// Return all active farms, or throw an error if the request fails. This is used on the home page to show a carousel of farms.
export async function getActiveFarms(): Promise<ActiveFarm[]> {
  const res = await fetch(`${API_BASE_URL}/farms`)
  if (!res.ok) throw new Error('Failed to fetch farms')
  return res.json()
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

export async function getMyFarm(token: string): Promise<Farm> {
  const res = await fetch(`${API_BASE_URL}/farms/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to fetch farm'))
  }
  return res.json()
}

export async function updateMyFarm(token: string, data: FarmUpdate): Promise<Farm> {
  const res = await fetch(`${API_BASE_URL}/farms/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
export async function uploadFarmImage(token: string, file: File): Promise<Farm> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE_URL}/farms/me/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Failed to upload image')
  }
  return res.json()
}

export async function deleteFarmImage(token: string, imageId: number): Promise<Farm> {
  const res = await fetch(`${API_BASE_URL}/farms/me/image/${imageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to delete image'))
  }
  return res.json()
}

export async function reorderFarmImages(token: string, imageIds: number[]): Promise<Farm> {
  const res = await fetch(`${API_BASE_URL}/farms/me/images/order`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
export async function uploadFarmDocument(token: string, file: File, documentType: FarmDocumentType): Promise<Farm> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('document_type', documentType)
  const res = await fetch(`${API_BASE_URL}/farms/me/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to upload document'))
  }
  return res.json()
}

export async function deleteFarmDocument(token: string, documentId: number): Promise<Farm> {
  const res = await fetch(`${API_BASE_URL}/farms/me/documents/${documentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to delete document'))
  }
  return res.json()
}

// Moves the farm from draft/rejected to pending once the profile is complete
// and all 3 documents are present. Missing requirements should block the
// button client-side; this is the fallback for whatever slips through.
export async function submitFarmForReview(token: string): Promise<Farm> {
  const res = await fetch(`${API_BASE_URL}/farms/me/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(err.detail, 'Failed to submit farm for review'))
  }
  return res.json()
}
