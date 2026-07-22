const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export type FarmImage = {
  id: number
  image_url: string
  position: number
}

export const FARM_IMAGE_LIMIT = 3

export type Farm = {
  id: number
  name: string
  location: string | null
  description: string | null
  capacity: number | null
  status: 'pending' | 'active'
  images: FarmImage[]
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
  capacity?: number | null
}

export function isFarmComplete(farm: Farm): boolean {
  return Boolean(farm.location && farm.description && farm.capacity)
}

export async function getMyFarm(token: string): Promise<Farm> {
  const res = await fetch(`${API_BASE_URL}/farms/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch farm')
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
  if (!res.ok) throw new Error('Failed to update farm')
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
  if (!res.ok) throw new Error('Failed to delete image')
  return res.json()
}

export async function reorderFarmImages(token: string, imageIds: number[]): Promise<Farm> {
  const res = await fetch(`${API_BASE_URL}/farms/me/images/order`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_ids: imageIds }),
  })
  if (!res.ok) throw new Error('Failed to reorder images')
  return res.json()
}
