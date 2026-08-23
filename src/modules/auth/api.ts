import { API_BASE_URL } from '../../lib/apiBase'
import { apiFetch } from '../../lib/apiFetch'
import { formatRateLimitMessage, getRetryAfterSeconds } from '../../lib/rateLimit'

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
// "email not verified" during login needs different handling than other
// errors). retryAfterSeconds is only set for 429s, letting a caller run a
// countdown/disable-submit UI without re-parsing the response itself.
export class ApiError extends Error {
  status: number
  retryAfterSeconds?: number
  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message)
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export async function registerVisitor(name: string, email: string, password: string): Promise<RegisterResult> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  if (res.status === 429) {
    throw new ApiError(formatRateLimitMessage(res), 429, getRetryAfterSeconds(res) ?? undefined)
  }
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
  if (res.status === 429) {
    throw new ApiError(formatRateLimitMessage(res), 429, getRetryAfterSeconds(res) ?? undefined)
  }
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
  if (res.status === 429) {
    throw new ApiError(formatRateLimitMessage(res), 429, getRetryAfterSeconds(res) ?? undefined)
  }
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new ApiError(error?.detail ?? 'This verification link is invalid or has expired', res.status)
  }
}

// The backend sets access_token/csrf_token via Set-Cookie on success — there's
// no token in the response body anymore, just a confirmation.
export async function login(email: string, password: string): Promise<void> {
  const body = new URLSearchParams({ username: email, password })
  const res = await apiFetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (res.status === 429) {
    throw new ApiError(formatRateLimitMessage(res), 429, getRetryAfterSeconds(res) ?? undefined)
  }
  if (!res.ok) {
    const error = await res.json()
    throw new ApiError(error.detail ?? 'Login failed', res.status)
  }
}

// Clears the access_token/csrf_token cookies server-side. JS can't delete an
// HttpOnly cookie itself, so this is the only way to actually log out.
export async function logout(): Promise<void> {
  await apiFetch('/logout', { method: 'POST' })
}

export async function getMe(): Promise<UserMe> {
  const res = await apiFetch('/me')
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

// Authenticated: the backend knows the caller's email from the session, so
// no email input is needed here — this just triggers a reset email to self.
export async function requestPasswordReset(): Promise<void> {
  const res = await apiFetch('/me/password/reset-request', { method: 'POST' })
  if (res.status === 429) {
    throw new ApiError(formatRateLimitMessage(res), 429, getRetryAfterSeconds(res) ?? undefined)
  }
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new ApiError(error?.detail ?? 'Failed to send password reset link', res.status)
  }
}

// Public (bare fetch, no cookies) so this works even if the user's session
// has expired by the time they click the emailed link.
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  })
  if (res.status === 429) {
    throw new ApiError(formatRateLimitMessage(res), 429, getRetryAfterSeconds(res) ?? undefined)
  }
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new ApiError(error?.detail ?? 'This reset link is invalid or has expired', res.status)
  }
}

export async function deleteAccount(): Promise<void> {
  const res = await apiFetch('/me', { method: 'DELETE' })
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.detail ?? 'Failed to delete account')
  }
}
