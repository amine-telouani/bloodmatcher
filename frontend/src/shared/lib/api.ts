import { clearSession, readSession } from './session'

/**
 * Where the Spring Boot backend lives. Empty means same origin (the dev proxy
 * forwards /api to Spring). Point it at e.g. 'http://localhost:8080' otherwise.
 */
export const API_BASE = ''

/** Every backend route the app calls, in one place. */
export const ENDPOINTS = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  /**
   * Password recovery. NOT YET CONFIRMED in the Spring backend — these are the
   * paths the frontend is ready for. If the backend uses different ones, change
   * them here; a 404/405/501 is shown to the user as "not available yet".
   */
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: '/api/auth/reset-password',
  hospitalProfile: '/api/hospitals/me',
  hospitalRequests: '/api/hospitals/me/requests',
  requestMatches: (id: string) => `/api/requests/${id}/matches`,
  requestStatus: (id: string) => `/api/requests/${id}/status`,
  donorProfile: '/api/donors/me',
  donorAvailability: '/api/donors/me/availability',
  donorAlerts: '/api/donors/me/requests',
  requestResponse: (id: string) => `/api/requests/${id}/response`,
}

export function apiUrl(path: string) {
  return `${API_BASE}${path}`
}

/** status 0 = the server could not be reached. */
export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>
  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/** Authenticated JSON request. A 401 clears the stored session so the app falls back to sign-in. */
export async function apiFetch<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const session = readSession()
  let res: Response
  try {
    res = await fetch(apiUrl(path), {
      method: init.method ?? 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Can’t reach Bloodmatcher right now. Check your connection and try again.')
  }
  const body = await res.json().catch(() => null)
  if (res.status === 401) {
    clearSession()
    throw new ApiError(401, 'Your session has ended. Please sign in again.')
  }
  if (res.status === 403) throw new ApiError(403, 'Your account can’t access this.')
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.message ?? 'Something went wrong on our side. Please try again in a moment.',
      readFieldErrors(body)
    )
  }
  return body as T
}

/** Reads Spring validation errors: `{ errors: { field: msg } }` or `{ fieldErrors|errors: [{ field, message }] }`. */
export function readFieldErrors(body: any): Record<string, string> {
  const out: Record<string, string> = {}
  const src = body?.fieldErrors ?? body?.errors
  if (Array.isArray(src)) {
    for (const item of src) if (item?.field) out[item.field] = item.message ?? item.defaultMessage ?? 'Check this field.'
  } else if (src && typeof src === 'object') {
    for (const [k, msg] of Object.entries(src)) out[k] = String(msg)
  }
  return out
}
