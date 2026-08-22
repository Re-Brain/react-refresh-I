const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

function getCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1]
}

// The backend's CSRF check only applies to mutating requests that carry the
// access_token cookie. There's no client-readable signal for whether that
// cookie is set (it's HttpOnly), so this keys off the csrf_token cookie
// instead — it's set alongside access_token at login, so its presence is an
// equivalent signal. Anonymous requests (no session) get no header, which is
// correct: the backend only checks it once a session cookie is present.
export function csrfHeaders(method: string): Record<string, string> {
  if (!MUTATING_METHODS.has(method.toUpperCase())) return {}
  const token = getCookie('csrf_token')
  return token ? { 'X-CSRF-Token': token } : {}
}
