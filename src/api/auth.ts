const API_BASE_URL = 'http://127.0.0.1:8000'

export type Token = {
  access_token: string
  token_type: string
}

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

export async function login(email: string, password: string): Promise<Token> {
  const body = new URLSearchParams({ username: email, password })
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new ApiError(error.detail ?? 'Login failed', res.status)
  }
  return res.json()
}

export async function getMe(token: string): Promise<UserMe> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/me/password`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.detail ?? 'Failed to change password')
  }
}

export async function deleteAccount(token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.detail ?? 'Failed to delete account')
  }
}
