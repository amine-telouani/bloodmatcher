import React, { useState } from 'react'

import { BloodBag, Heart } from '../shared/components/BmArt'
import { BmLink, BmNav } from '../shared/components/BmNav'
import { apiUrl, ENDPOINTS } from '../shared/lib/api'
import { homeFor, normaliseRole, storeSession, type Role } from '../shared/lib/session'

import '../shared/styles/bloodmatch.css'

export const args = {
  state: 'default',
  email: '',
  mockApi: true,
}

export const argTypes = {
  state: { control: 'select', options: ['default', 'loading', 'error', 'success'] },
  email: { control: 'text' },
  mockApi: { control: 'boolean' },
}

type Props = Partial<typeof args> & {
  onNavigate?: (path: string) => void
}

export default function SignIn(props: Props) {
  const { state, email: initialEmail, mockApi, onNavigate } = { ...args, ...props }
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [destination, setDestination] = useState<string | null>(null)

  // The `state` arg previews a state; once the user acts, live status wins.
  const shown = status !== 'idle' ? status : state === 'default' ? 'idle' : state
  const loading = shown === 'loading'
  const error = shown === 'error'
  const canSubmit = email.trim() !== '' && password !== '' && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('loading')
    try {
      const data = mockApi ? await mockLogin(email, password) : await login(email, password)
      storeSession(data)
      const path = homeFor(data.role)
      setDestination(path)
      setStatus('success')
      if (onNavigate) onNavigate(path)
      else window.history.pushState({}, '', path)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="bm-page">
      <div className="bm-panel">
        <BmNav active="/login" onNavigate={onNavigate} />

        <main className="bm-main">
          <Heart className="bm-heart bm-heart-1" />
          <Heart className="bm-heart bm-heart-2" />
          <Heart className="bm-heart bm-heart-3" />

          <section className="bm-intro">
            <h1 className="bm-title">
              Welcome
              <br />
              back
            </h1>
            <p className="bm-script">every drop finds its match</p>
            <div className="bm-dots" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => <span key={i} />)}
            </div>
            <p className="bm-tag">Together, we're stronger</p>
            <p className="bm-lede">
              Sign in to see blood requests near you, or to post urgent needs for your hospital.
            </p>
          </section>

          <section className="bm-card" aria-labelledby="signin-heading">
            <h2 id="signin-heading" className="bm-card-title">Sign in</h2>

            {shown === 'success' ? (
              <div className="bm-success" role="status">
                <p className="bm-success-title">You're signed in.</p>
                <p>Taking you to <code>{destination ?? '/donor'}</code>…</p>
              </div>
            ) : (
              <form className="bm-form" onSubmit={handleSubmit} noValidate>
                <div className="bm-field">
                  <label htmlFor="bm-email">Email</label>
                  <input
                    id="bm-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                    aria-invalid={error}
                    aria-describedby={error ? 'bm-error' : undefined}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="bm-field">
                  <div className="bm-label-row">
                    <label htmlFor="bm-password">Password</label>
                    <BmLink href="/forgot-password" onNavigate={onNavigate} className="bm-link-small">Forgot password?</BmLink>
                  </div>
                  <input
                    id="bm-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (status === 'error') setStatus('idle') }}
                    aria-invalid={error}
                    aria-describedby={error ? 'bm-error' : undefined}
                    disabled={loading}
                    required
                  />
                </div>

                {error && (
                  <p id="bm-error" className="bm-error" role="alert">
                    Invalid email or password
                  </p>
                )}

                <button
                  type="submit"
                  className="bm-button"
                  disabled={!canSubmit}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span className="bm-spinner" aria-hidden="true" /> Signing in…
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>

                <p className="bm-register">
                  New to Bloodmatcher? <BmLink href="/register" onNavigate={onNavigate}>Create an account</BmLink>
                </p>
              </form>
            )}
          </section>

          <BloodBag />
          <p className="bm-follow">stay informed,<br />follow us</p>
        </main>
      </div>
    </div>
  )
}

/* ---------- API ---------- */

type LoginResponse = { token: string; role: Role; user?: { id: string; email: string; name?: string } | null }

async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(apiUrl(ENDPOINTS.login), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Invalid credentials')
  const data = await res.json()
  const role = normaliseRole(data?.role)
  if (!data?.token || !role) throw new Error('Bad response')
  return { token: String(data.token), role, user: data.user ?? null }
}

/** Preview stand-in for the API: "wrong" as password fails, emails with "hospital" sign in as a hospital. */
function mockLogin(email: string, password: string): Promise<LoginResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password === 'wrong' || password.length < 4 || !email.includes('@')) return reject(new Error('Invalid'))
      resolve({
        token: 'demo-' + Math.random().toString(36).slice(2),
        role: email.toLowerCase().includes('hospital') ? 'hospital' : 'donor',
        user: { id: 'u_1', email },
      })
    }, 900)
  })
}
