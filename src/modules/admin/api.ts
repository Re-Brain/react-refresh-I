import type { Farm, FarmDocument, Horse, HorseDocument } from '../farm'
import { csrfHeaders } from '../../lib/csrf'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export type AdminFarm = Omit<Farm, 'documents'> & {
  // Always present on the admin view, unlike the owner-only optional field on Farm.
  documents: FarmDocument[]
}
export type AdminHorse = Omit<Horse, 'documents'> & {
  // Denormalized for display, same idea as Booking's horse_name/farm_name.
  farm_name?: string | null
  // Always present on the admin view, unlike the owner-only optional field on Horse.
  documents: HorseDocument[]
}

function messageFromDetail(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') return detail[0].msg
  return fallback
}

export async function getPendingFarms(): Promise<AdminFarm[]> {
  const res = await fetch(`${API_BASE_URL}/admin/farms?status=pending`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to load pending farms.')
  return res.json()
}

export async function getAdminFarm(id: number): Promise<AdminFarm> {
  const res = await fetch(`${API_BASE_URL}/admin/farms/${id}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(body?.detail, 'Failed to load farm.'))
  }
  return res.json()
}

export async function updateFarmApproval(
  id: number,
  status: Extract<AdminFarm['status'], 'active' | 'rejected'>,
  reason?: string
): Promise<AdminFarm> {
  const res = await fetch(`${API_BASE_URL}/admin/farms/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...csrfHeaders('PATCH') },
    body: JSON.stringify(reason ? { status, reason } : { status }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(body?.detail, 'Failed to update the farm.'))
  }
  return res.json()
}

export async function getPendingHorses(): Promise<AdminHorse[]> {
  const res = await fetch(`${API_BASE_URL}/admin/horses?status=pending`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to load pending horses.')
  return res.json()
}

export async function updateHorseApproval(
  id: number,
  status: Extract<AdminHorse['status'], 'approved' | 'rejected'>,
  reason?: string
): Promise<AdminHorse> {
  const res = await fetch(`${API_BASE_URL}/admin/horses/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...csrfHeaders('PATCH') },
    body: JSON.stringify(reason ? { status, reason } : { status }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(messageFromDetail(body?.detail, 'Failed to update the horse.'))
  }
  return res.json()
}
