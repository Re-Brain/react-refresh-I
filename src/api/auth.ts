const API_BASE_URL = 'http://127.0.0.1:8000'

export type Token = {
  access_token: string
  token_type: string
}

export type UserMe = {
  id: number
  name: string
  email: string
  role: string
}

export async function registerVisitor(name: string, email: string, password: string): Promise<Token> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail ?? 'Registration failed')
  }
  return res.json()
}

export async function registerFarmer(name: string, email: string, password: string, farmName: string): Promise<Token> {
  const res = await fetch(`${API_BASE_URL}/register/farmer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, farm_name: farmName }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail ?? 'Registration failed')
  }
  return res.json()
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
    throw new Error(error.detail ?? 'Login failed')
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
