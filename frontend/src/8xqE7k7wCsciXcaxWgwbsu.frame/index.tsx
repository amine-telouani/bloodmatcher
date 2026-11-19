
import { NavProvider } from '../shared/bloodmatcher/nav'
import { useState, type FormEvent } from 'react'
import { useNavigate } from '../shared/bloodmatcher/nav'

import { BloodBag, Heart } from '../shared/bloodmatcher/components/BmArt'
import { BmLink, BmNav } from '../shared/bloodmatcher/components/BmNav'
import { clearSession, homeFor, normaliseRole, storeSession } from '../shared/bloodmatcher/lib/session'


/** Register stores the freshly created email here so Sign in can prefill it. */
const PREFILL_KEY = 'bm:registeredEmail'

function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => {
    const prefill = sessionStorage.getItem(PREFILL_KEY)
    if (prefill) sessionStorage.removeItem(PREFILL_KEY)
    return prefill ?? ''
  })
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [destination, setDestination] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const shown = status
  const loading = shown === 'loading'
  const error = shown === 'error'
  const canSubmit = email.trim() !== '' && password !== '' && !loading

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('loading')
    setErrorMessage('')
    try {
      const credentials = btoa(`${email}:${password}`)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.status === 401) {
        clearSession()
        setErrorMessage('Invalid email or password')
        setStatus('error')
        return
      }

      if (!response.ok) {
        clearSession()
        setErrorMessage('Server is waking up, try again in a minute')
        setStatus('error')
        return
      }

      const data = await response.json()
      const role = normaliseRole(data.role)
      if (!role) {
        clearSession()
        setErrorMessage('Server is waking up, try again in a minute')
        setStatus('error')
        return
      }
      storeSession({
        email,
        role,
        credentials,
        user: data.email
          ? { id: '', email: data.email, name: data.email }
          : { id: '', email },
      })
      const path = homeFor(role)
      setDestination(path)
      setStatus('success')
      navigate(path)
    } catch {
      clearSession()
      setErrorMessage('Server is waking up, try again in a minute')
      setStatus('error')
    }
  }

  return (
    <div className="bm-page">
      <div className="bm-panel">
        <BmNav active="/login" onNavigate={navigate} />

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
                    {errorMessage}
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
                  New to Bloodmatcher? <BmLink href="/register" onNavigate={navigate}>Create an account</BmLink>
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



/* ---------- frame ---------- */

type Props = Partial<typeof args> & { onNavigate?: (path: string) => void }

export default function SignIn(props: Props) {
  const { onNavigate, ...rest } = { ...args, ...props }
  return (
    <NavProvider onNavigate={onNavigate} params={rest as Record<string, string>}>
      <SignInPage />
    </NavProvider>
  )
}

export const args = {}

export const argTypes = {}
