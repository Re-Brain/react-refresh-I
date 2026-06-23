const API_BASE_URL = 'http://127.0.0.1:8000'

export type HorseImage = {
  id: number
  image_url: string
}

export type RaceRecord = {
  id: number
  race_date: string
  course: string
  race_name: string
  grade: string
  finish_position: number
  track: string
  distance: number
  condition: string
  horse_id: number
}

export type RaceRecordUpdate = Partial<Omit<RaceRecord, 'id' | 'horse_id'>>

export type Horse = {
  id: number
  name: string
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
  images: HorseImage[]
  race_records: RaceRecord[]
}

export type HorseCreate = Omit<Horse, 'id' | 'images' | 'farm_id'>
export type HorseUpdate = Partial<HorseCreate>

export async function getHorse(token: string, id: number): Promise<Horse> {
  const res = await fetch(`${API_BASE_URL}/horses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch horse')
  return res.json()
}

export async function getAllHorses(): Promise<Horse[]> {
  const res = await fetch(`${API_BASE_URL}/horses`)
  if (!res.ok) throw new Error('Failed to fetch horses')
  return res.json()
}

export async function getHorsePublic(id: number): Promise<Horse> {
  const res = await fetch(`${API_BASE_URL}/horses/${id}`)
  if (!res.ok) throw new Error('Horse not found')
  return res.json()
}

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

export async function uploadHorseImage(token: string, horseId: number, file: File): Promise<Horse> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE_URL}/horses/${horseId}/image`, {
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

export async function updateRaceRecord(token: string, horseId: number, recordId: number, data: RaceRecordUpdate): Promise<RaceRecord> {
  const res = await fetch(`${API_BASE_URL}/horses/${horseId}/race-records/${recordId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update race record')
  return res.json()
}

export async function deleteHorseImage(token: string, horseId: number, imageId: number): Promise<Horse> {
  const res = await fetch(`${API_BASE_URL}/horses/${horseId}/image/${imageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to delete image')
  return res.json()
}
