export type Horse = {
  id: number
  name: string
  title: string
  img: string
  age: number
  record: string
  trainer: string
}

const API_BASE_URL = 'http://127.0.0.1:8000'

export async function getHorses(): Promise<Horse[]> {
  const res = await fetch(`${API_BASE_URL}/horses`)
  if (!res.ok) throw new Error('Failed to fetch horses')
  return res.json()
}

export async function getHorseById(id: number): Promise<Horse> {
  const res = await fetch(`${API_BASE_URL}/horses/${id}`)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail ?? `Failed to fetch horse with id ${id}`)
  }
  return res.json()
}
