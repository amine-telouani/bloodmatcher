export type Role = 'hospital' | 'donor'

export type Session = {
  token: string
  role: Role
  user?: { id: string; email: string; name?: string } | null
}

const KEY = 'bloodmatch.session'

export function storeSession(data: Session) {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ token: data.token, role: data.role, user: data.user ?? null, signedInAt: Date.now() })
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
    if (!data?.token || !role) return null
    return { token: String(data.token), role, user: data.user ?? null }
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
  } catch {
    /* nothing stored */
  }
}

export function homeFor(role: Role) {
  return role === 'hospital' ? '/hospital' : '/donor'
}

/** Accepts the backend's role in any case ("HOSPITAL", "donor"). */
export function normaliseRole(value: unknown): Role | null {
  const r = String(value ?? '').toLowerCase()
  return r === 'hospital' || r === 'donor' ? r : null
}
