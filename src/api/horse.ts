const API_BASE_URL = 'http://127.0.0.1:8000'

export type Horse = {
  id: number
  name: string
  breed: string | null
  age: number | null
  gender: 'male' | 'female' | 'gelding' | null
  sire: string | null
  dam: string | null
  sires_sire: string | null
  sires_dam: string | null
  dams_sire: string | null
  dams_dam: string | null
}

export type HorseCreate = Omit<Horse, 'id'>
export type HorseUpdate = Partial<HorseCreate>

export async function getMyHorses(token: string): Promise<Horse[]> {
  const res = await fetch(`${API_BASE_URL}/horses/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch horses')
  return res.json()
}

export async function createHorse(token: string, data: HorseCreate): Promise<Horse> {
  const res = await fetch(`${API_BASE_URL}/horses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create horse')
  return res.json()
}

export async function updateHorse(token: string, id: number, data: HorseUpdate): Promise<Horse> {
  const res = await fetch(`${API_BASE_URL}/horses/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update horse')
  return res.json()
}

export async function deleteHorse(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/horses/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to delete horse')
}
