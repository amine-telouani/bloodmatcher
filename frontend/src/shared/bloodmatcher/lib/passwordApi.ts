
import { ApiError, apiUrl, ENDPOINTS, readFieldErrors } from './api'

/**
 * Password-recovery requests.
 *
 * Contract the frontend expects (to be confirmed against the backend):
 *   POST /api/auth/forgot-password  { email }               → 2xx, same response whether or not the email exists
 *   POST /api/auth/reset-password   { token, newPassword }  → 2xx on success; 400/410 when the token is bad or expired
 *
 * Until the backend ships these, a 404/405/501 surfaces as a clear
 * "not available yet" message instead of a fake success.
 */

const NOT_AVAILABLE = 'Password reset isn’t available yet. Please contact support to regain access.'
const OFFLINE = 'Can’t reach Bloodmatcher right now. Check your connection and try again.'

export async function requestPasswordReset(email: string): Promise<void> {
  const res = await post(ENDPOINTS.forgotPassword, { email })
  if (res.ok) return
  const body = await res.json().catch(() => null)
  if ([404, 405, 501].includes(res.status)) throw new ApiError(res.status, NOT_AVAILABLE)
  if (res.status === 400) {
    const fields = readFieldErrors(body)
    throw new ApiError(400, fields['email'] ?? body?.message ?? 'Enter a valid email, like name@example.com.', fields)
  }
  if (res.status === 429) throw new ApiError(429, 'Too many requests. Wait a few minutes, then try again.')
  throw new ApiError(res.status, 'Something went wrong on our side. Please try again in a moment.')
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await post(ENDPOINTS.resetPassword, { token, newPassword })
  if (res.ok) return
  const body = await res.json().catch(() => null)
  if ([405, 501].includes(res.status)) throw new ApiError(res.status, NOT_AVAILABLE)
  if (res.status === 404 && !body) throw new ApiError(404, NOT_AVAILABLE)
  if (res.status === 400 || res.status === 404 || res.status === 410) {
    const fields = readFieldErrors(body)
    if (fields['newPassword'] || fields['password']) {
      throw new ApiError(400, fields['newPassword'] ?? fields['password'] ?? 'Enter a new password.', fields)
    }
    throw new ApiError(410, 'This reset link has expired or was already used.')
  }
  throw new ApiError(res.status, 'Something went wrong on our side. Please try again in a moment.')
}

async function post(path: string, body: unknown): Promise<Response> {
  try {
    return await fetch(apiUrl(path), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, OFFLINE)
  }
}

/* ---------- Preview stand-ins ---------- */

/** Emails containing "offline" fail as a network error; every other valid email succeeds (unknown ones too). */
export function mockRequestPasswordReset(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email.toLowerCase().includes('offline')) return reject(new ApiError(0, OFFLINE))
      resolve()
    }, 900)
  })
}

/** Token "expired" fails as an expired link; "offline" as a network error. */
export function mockResetPassword(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (token === 'expired') return reject(new ApiError(410, 'This reset link has expired or was already used.'))
      if (token === 'offline') return reject(new ApiError(0, OFFLINE))
      resolve()
    }, 900)
  })
}

/* ---------- Validation ---------- */

export function validateEmail(email: string): string | null {
  const v = email.trim()
  if (!v) return 'Enter the email you registered with.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email, like name@example.com.'
  return null
}

/** Same rule as registration: 8+ characters with a letter and a number. */
export function validateNewPassword(password: string): string | null {
  if (!password) return 'Choose a new password.'
  if (password.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Include at least one letter and one number.'
  return null
}

