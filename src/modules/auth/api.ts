import { csrfHeaders } from '../../lib/csrf'
import { API_BASE_URL } from '../../lib/apiBase'

export type RegisterResult = {
  detail: string
  email: string
}

export type UserMe = {
  id: number
  name: string
  email: string
  role: string
}

// Thrown for HTTP error responses so callers can branch on status (e.g. 403
// "email not verified" during login needs different handling than other errors).
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function registerVisitor(name: string, email: string, password: string): Promise<RegisterResult> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new ApiError(error.detail ?? 'Registration failed', res.status)
  }
  return res.json()
}

export async function registerFarmer(name: string, email: string, password: string, farmName: string): Promise<RegisterResult> {
  const res = await fetch(`${API_BASE_URL}/register/farmer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, farm_name: farmName }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new ApiError(error.detail ?? 'Registration failed', res.status)
  }
  return res.json()
}

export async function verifyEmail(token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new ApiError(error?.detail ?? 'This verification link is invalid or has expired', res.status)
  }
}

// The backend sets access_token/csrf_token via Set-Cookie on success — there's
// no token in the response body anymore, just a confirmation.
export async function login(email: string, password: string): Promise<void> {
  const body = new URLSearchParams({ username: email, password })
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new ApiError(error.detail ?? 'Login failed', res.status)
  }
}

// Clears the access_token/csrf_token cookies server-side. JS can't delete an
// HttpOnly cookie itself, so this is the only way to actually log out.
export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...csrfHeaders('POST') },
  })
}

export async function getMe(): Promise<UserMe> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/me/password`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders('PATCH'),
    },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.detail ?? 'Failed to change password')
  }
}

export async function deleteAccount(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { ...csrfHeaders('DELETE') },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.detail ?? 'Failed to delete account')
  }
}
