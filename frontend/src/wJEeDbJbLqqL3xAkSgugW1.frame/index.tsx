import React, { useState } from 'react'

import { BloodBag, Heart } from '../shared/components/BmArt'
import { BmLink, BmNav } from '../shared/components/BmNav'
import { ApiError } from '../shared/lib/api'
import { mockResetPassword, resetPassword, validateNewPassword } from '../shared/lib/passwordApi'

import '../shared/styles/bloodmatch.css'

export const args = {
  state: 'default',
  token: 'demo-reset-token',
  mockApi: true,
}

export const argTypes = {
  state: { control: 'select', options: ['default', 'invalid', 'loading', 'error', 'expired', 'success'] },
  token: { control: 'text' },
  mockApi: { control: 'boolean' },
}

type Props = Partial<typeof args> & {
  onNavigate?: (path: string) => void
}

type Status = 'idle' | 'loading' | 'error' | 'expired' | 'success'
type Errors = { password?: string; confirm?: string }

/** Route: /reset-password?token=… — the link in the reset email. */
export default function ResetPassword(props: Props) {
  const { state, token: argToken, mockApi, onNavigate } = { ...args, ...props }
  const [token] = useState(() => readTokenFromUrl() ?? argToken)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [interacted, setInteracted] = useState(false)

  // The `state` arg previews a state; once the user acts, live state wins.
  const preview = interacted ? null : state
  const missingToken = !token.trim()
  const shown: Status = missingToken
    ? 'expired'
    : preview === 'loading' || preview === 'error' || preview === 'expired' || preview === 'success'
      ? preview
      : status
  const shownErrors: Errors =
    preview === 'invalid'
      ? { password: 'Include at least one letter and one number.', confirm: 'Passwords don’t match.' }
      : errors
  const shownFormError =
    formError ?? (preview === 'error' ? 'Can’t reach Bloodmatcher right now. Check your connection and try again.' : null)
  const loading = shown === 'loading'

  function validate(): Errors {
    const next: Errors = {}
    const p = validateNewPassword(password)
    if (p) next.password = p
    if (!confirm) next.confirm = 'Type your new password again.'
    else if (confirm !== password) next.confirm = 'Passwords don’t match.'
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setInteracted(true)
    const next = validate()
    setErrors(next)
    setFormError(null)
    if (next.password || next.confirm) {
      document.getElementById(next.password ? 'rp-password' : 'rp-confirm')?.focus()
      setStatus('idle')
      return
    }
    setStatus('loading')
    try {
      await (mockApi ? mockResetPassword(token) : resetPassword(token, password))
      setStatus('success')
    } catch (err) {
      if (err instanceof ApiError && err.status === 410) {
        setStatus('expired')
      } else if (err instanceof ApiError && err.status === 400) {
        setErrors({ password: err.message })
        setStatus('idle')
      } else {
        setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
        setStatus('error')
      }
    }
  }

  function edit(field: 'password' | 'confirm', value: string) {
    setInteracted(true)
    if (field === 'password') setPassword(value)
    else setConfirm(value)
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
    if (status === 'error') { setStatus('idle'); setFormError(null) }
  }

  return (
    <div className="bm-page">
      <div className="bm-panel">
        <BmNav onNavigate={onNavigate} />

        <main className="bm-main">
          <Heart className="bm-heart bm-heart-1" />
          <Heart className="bm-heart bm-heart-2" />
          <Heart className="bm-heart bm-heart-3" />

          <section className="bm-intro">
            <h1 className="bm-title">
              Fresh
              <br />
              start
            </h1>
            <p className="bm-script">almost back in</p>
            <div className="bm-dots" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => <span key={i} />)}
            </div>
            <p className="bm-tag">Together, we're stronger</p>
            <p className="bm-lede">
              Choose a new password for your Bloodmatcher account. You’ll sign in with it straight after.
            </p>
          </section>

          <section className="bm-card" aria-labelledby="rp-heading">
            {shown === 'success' ? (
              <div className="bm-success" role="status">
                <div className="bm-success-mark" aria-hidden="true">
                  <CheckIcon />
                </div>
                <h2 id="rp-heading" className="bm-card-title">Password updated</h2>
                <p className="bm-success-body">
                  Your new password is set. Sign in with it to see requests near you.
                </p>
                <BmLink href="/login" onNavigate={onNavigate} className="bm-button">
                  Sign in
                </BmLink>
              </div>
            ) : shown === 'expired' ? (
              <div className="bm-success" role="alert">
                <h2 id="rp-heading" className="bm-card-title">
                  {missingToken ? 'This link is incomplete' : 'This link has expired'}
                </h2>
                <p className="bm-success-body">
                  {missingToken
                    ? 'The reset link is missing part of its address. Open it again from your email, or request a new one.'
                    : 'Reset links work once and only for a short while. Request a new one and use it from your latest email.'}
                </p>
                <div className="bm-success-actions">
                  <BmLink href="/forgot-password" onNavigate={onNavigate} className="bm-button">
                    Request a new link
                  </BmLink>
                  <BmLink href="/login" onNavigate={onNavigate} className="bm-link-small">
                    Back to sign in
                  </BmLink>
                </div>
              </div>
            ) : (
              <>
                <h2 id="rp-heading" className="bm-card-title">Choose a new password</h2>

                <form className="bm-form" onSubmit={handleSubmit} noValidate>
                  <div className="bm-field">
                    <label htmlFor="rp-password">New password</label>
                    <div className="bm-input-wrap">
                      <input
                        id="rp-password"
                        type={show ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => edit('password', e.target.value)}
                        aria-invalid={!!shownErrors.password}
                        aria-describedby={shownErrors.password ? 'rp-password-error' : 'rp-password-hint'}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        className="bm-reveal"
                        onClick={() => setShow((s) => !s)}
                        aria-pressed={show}
                        aria-label={show ? 'Hide passwords' : 'Show passwords'}
                        disabled={loading}
                      >
                        {show ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {shownErrors.password ? (
                      <p id="rp-password-error" className="bm-field-error">{shownErrors.password}</p>
                    ) : (
                      <p id="rp-password-hint" className="bm-hint">8+ characters, with a letter and a number.</p>
                    )}
                  </div>

                  <div className="bm-field">
                    <label htmlFor="rp-confirm">Confirm new password</label>
                    <input
                      id="rp-confirm"
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Type it again"
                      value={confirm}
                      onChange={(e) => edit('confirm', e.target.value)}
                      aria-invalid={!!shownErrors.confirm}
                      aria-describedby={shownErrors.confirm ? 'rp-confirm-error' : undefined}
                      disabled={loading}
                      required
                    />
                    {shownErrors.confirm && (
                      <p id="rp-confirm-error" className="bm-field-error">{shownErrors.confirm}</p>
                    )}
                  </div>

                  {shown === 'error' && shownFormError && (
                    <p className="bm-error" role="alert">{shownFormError}</p>
                  )}

                  <button type="submit" className="bm-button" disabled={loading} aria-busy={loading}>
                    {loading ? (
                      <>
                        <span className="bm-spinner" aria-hidden="true" /> Saving…
                      </>
                    ) : (
                      'Set new password'
                    )}
                  </button>

                  <p className="bm-register">
                    <BmLink href="/login" onNavigate={onNavigate}>Back to sign in</BmLink>
                  </p>
                </form>
              </>
            )}
          </section>

          <BloodBag />
          <p className="bm-follow">stay informed,<br />follow us</p>
        </main>
      </div>
    </div>
  )
}

/** The email links to /reset-password?token=…; outside that route the `token` arg stands in. */
function readTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  if (!window.location.pathname.startsWith('/reset-password')) return null
  return new URLSearchParams(window.location.search).get('token')
}

function CheckIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
      <path d="M2 8.5 7.5 14 18 2" fill="none" stroke="var(--bm-red)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
