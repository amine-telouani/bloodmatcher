
export type Role = 'hospital' | 'donor' | 'admin'

export type Session = {
  email: string
  role: Role
  credentials: string
  user?: { id: string; email: string; name?: string } | null
}

export type StoredSession = {
  role: Role
  email: string
  credentials: string
  user?: { id: string; email: string; name?: string } | null
}

const KEY = 'bloodmatch.session'
const CRED_KEY = 'bloodmatch.credentials'

/** HTTP Basic auth needs the raw email + password on every call, so both live in sessionStorage. */
export function storeCredentials(email: string, password: string) {
  try {
    sessionStorage.setItem(CRED_KEY, JSON.stringify({ email, password }))
  } catch {
    /* storage unavailable (private mode) — session lives for this page only */
  }
}

/** The stored Basic credentials, or null when there are none or they are unreadable. */
export function readCredentials(): { email: string; password: string } | null {
  try {
    const raw = sessionStorage.getItem(CRED_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (typeof data?.email !== 'string' || typeof data?.password !== 'string') return null
    return { email: data.email, password: data.password }
  } catch {
    return null
  }
}

export function storeSession(data: Session) {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ email: data.email, role: data.role, credentials: data.credentials, user: data.user ?? null, signedInAt: Date.now() })
    )
  } catch {
    /* storage unavailable (private mode) — session lives for this page only */
  }
}

/** The stored session, or null when there is none or it is unreadable / has an unknown role. */
export function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    const role = normaliseRole(data?.role)
    if (!data || !role) return null
    if (typeof data.email !== 'string' || typeof data.credentials !== 'string') return null
    return { email: data.email, role, credentials: data.credentials, user: data.user ?? null }
  } catch {
    return null
  }
}

/** The stored role as written, even when it is not one we know — for the unknown-role state. */
export function readRawRole(): string | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? String(JSON.parse(raw)?.role ?? '') : null
  } catch {
    return null
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY)
    sessionStorage.removeItem(CRED_KEY)
  } catch {
    /* nothing stored */
  }
}

export function homeFor(role: Role) {
  if (role === 'hospital') return '/hospital'
  if (role === 'admin') return '/admin'
  return '/donor'
}

/** Accepts the backend's role in any case ("HOSPITAL", "donor"). */
export function normaliseRole(value: unknown): Role | null {
  const r = String(value ?? '').toLowerCase()
  if (r === 'hospital' || r === 'admin') return r
  return r === 'donor' ? r : null
}

