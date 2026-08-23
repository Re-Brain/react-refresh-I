import { csrfHeaders } from './csrf'
import { API_BASE_URL } from './apiBase'

// Dispatched when a silent refresh fails (the refresh session itself is
// invalid/expired). AuthProvider listens for this and clears the user, which
// sends every ProtectedRoute-guarded page to /login via its existing redirect
// — there's no direct router access from this module, so a DOM event is the
// simplest way to notify it from outside the component tree.
export const AUTH_LOGGED_OUT_EVENT = 'auth:logged-out'

// Refreshing in response to a failed /login, /refresh, or /logout request
// would be nonsensical — there's either no session yet, or one already being
// torn down — so these never trigger the retry flow themselves.
const SKIP_REFRESH_PATHS = new Set(['/login', '/refresh', '/logout'])

// Shared by every concurrent 401 so a burst of requests hitting an expired
// access token at once triggers exactly one /refresh call, not one each.
let refreshPromise: Promise<boolean> | null = null

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...csrfHeaders('POST') },
    })
      .then(res => {
        if (res.ok) return true
        window.dispatchEvent(new Event(AUTH_LOGGED_OUT_EVENT))
        return false
      })
      .catch(() => {
        window.dispatchEvent(new Event(AUTH_LOGGED_OUT_EVENT))
        return false
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function request(path: string, options: RequestInit): Promise<Response> {
  const method = options.method ?? 'GET'
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { ...options.headers, ...csrfHeaders(method) },
  })
}

// Every authenticated call in the app goes through this instead of a bare
// fetch. On a 401 (expired access token) it transparently refreshes the
// session once and retries the original request — callers never see the
// expiry unless the refresh itself fails (session truly over), in which case
// this returns the original 401 for the caller's normal error handling.
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await request(path, options)
  if (res.status !== 401 || SKIP_REFRESH_PATHS.has(path)) return res

  const refreshed = await refreshSession()
  if (!refreshed) return res

  return request(path, options)
}
