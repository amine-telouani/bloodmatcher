import { clearSession, readCredentials } from './session'

/** Relative /api paths only: Vercel rewrites them to the backend. */
export const API_BASE = ''

/** Every backend route the app calls, in one place. */
export const ENDPOINTS = {
  // --- real backend endpoints ---
  login: '/api/auth/login',
  register: '/api/auth/register',
  donorProfile: '/api/donors/me', // GET and PUT
  donorAlerts: '/api/donors/me/alerts', // GET
  responseAccept: (id: string | number) => `/api/responses/${id}/accept`,
  responseDecline: (id: string | number) => `/api/responses/${id}/decline`,
  responseDonated: (id: string | number) => `/api/responses/${id}/donated`,
  requestCreate: '/api/requests', // POST
  requestById: (id: string | number) => `/api/requests/${id}`, // GET
  requestCancel: (id: string | number) => `/api/requests/${id}/cancel`, // POST
  adminVerify: (id: string | number) => `/api/admin/hospitals/${id}/verify`, // PUT
  adminStats: '/api/admin/stats', // GET

  // --- MOCK: no backend endpoint (password recovery) ---
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: '/api/auth/reset-password',

  // --- OLD invented endpoints: delete once the pages using them are rewritten ---
  hospitalProfile: '/api/hospitals/me',
  hospitalRequests: '/api/hospitals/me/requests',
  requestMatches: (id: string) => `/api/requests/${id}/matches`,
  requestStatus: (id: string) => `/api/requests/${id}/status`,
  donorAvailability: '/api/donors/me/availability',
  requestResponse: (id: string) => `/api/requests/${id}/response`,
  requestDonations: (id: string) => `/api/requests/${id}/donations`,
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

/** HTTP Basic header value, UTF-8 safe. */
export function basicAuth(email: string, password: string) {
  const bytes = new TextEncoder().encode(`${email}:${password}`)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return `Basic ${btoa(binary)}`
}

/** Authenticated JSON request. 401 clears the session. Never crashes on an empty body. */
export async function apiFetch<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const creds = readCredentials()
  let res: Response
  try {
    res = await fetch(apiUrl(path), {
      method: init.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(creds ? { Authorization: basicAuth(creds.email, creds.password) } : {}),
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
    })
  } catch {
    throw new ApiError(0, 'Can’t reach Bloodmatcher right now. Check your connection and try again.')
  }
  const body = await res.json().catch(() => null)
  if (res.status === 401) {
    clearSession()
    throw new ApiError(401, 'Your session has ended. Please sign in again.')
  }
  if (!res.ok) {
    const serverMsg = typeof body?.error === 'string' ? body.error : typeof body?.message === 'string' ? body.message : ''
    const fallback =
        res.status === 403
            ? 'Your account can’t access this.'
            : 'Something went wrong on our side. Please try again in a moment.'
    throw new ApiError(res.status, serverMsg || fallback, res.status === 400 ? readFieldErrors(body) : {})
  }
  return body as T
}

/** Validation 400 = flat map {field: message}. Also accepts the array shapes. */
export function readFieldErrors(body: any): Record<string, string> {
  const out: Record<string, string> = {}
  const src = body?.fieldErrors ?? body?.errors
  if (Array.isArray(src)) {
    for (const item of src) if (item?.field) out[item.field] = item.message ?? item.defaultMessage ?? 'Check this field.'
  } else if (src && typeof src === 'object') {
    for (const [k, msg] of Object.entries(src)) out[k] = String(msg)
  } else if (body && typeof body === 'object') {
    for (const [k, msg] of Object.entries(body)) {
      if (k !== 'error' && k !== 'message') out[k] = typeof msg === 'string' ? msg : 'Check this field.'
    }
  }
  return out
}