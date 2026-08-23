// Single source of truth for the backend origin. Reads VITE_API_URL
// (see .env) so every module hits the same host — the cookie-based auth
// contract requires the frontend to call it via the exact hostname the
// backend set its cookies for (localhost, not 127.0.0.1 — different cookie
// hosts to the browser despite both resolving to loopback).
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
