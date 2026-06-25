const API_BASE_URL = 'http://127.0.0.1:8000'

export type Farm = {
  name: string
  location: string | null
  description: string | null
  capacity: number | null
  status: 'pending' | 'active'
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
