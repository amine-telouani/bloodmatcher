import React, { useState } from 'react'

import { BloodBag, Heart } from '../shared/components/BmArt'
import { BmLink, BmNav } from '../shared/components/BmNav'
import { ApiError } from '../shared/lib/api'
import { mockRequestPasswordReset, requestPasswordReset, validateEmail } from '../shared/lib/passwordApi'

import '../shared/styles/bloodmatch.css'

export const args = {
  state: 'default',
  email: '',
  mockApi: true,
}

export const argTypes = {
  state: { control: 'select', options: ['default', 'invalid', 'loading', 'error', 'success'] },
  email: { control: 'text' },
  mockApi: { control: 'boolean' },
}

type Props = Partial<typeof args> & {
  onNavigate?: (path: string) => void
  /** Prototype-only: stands in for clicking the link in the email, while the API is mocked. */
  onOpenResetLink?: () => void
}

type Status = 'idle' | 'loading' | 'error' | 'success'

export default function ForgotPassword(props: Props) {
  const { state, email: initialEmail, mockApi, onNavigate, onOpenResetLink } = { ...args, ...props }
  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<Status>('idle')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState('')
  const [interacted, setInteracted] = useState(false)

  // The `state` arg previews a state; once the user acts, live state wins.
  const preview = interacted ? null : state
  const shown: Status =
    preview === 'loading' || preview === 'error' || preview === 'success' ? preview : status
  const shownFieldError = fieldError ?? (preview === 'invalid' ? 'Enter a valid email, like name@example.com.' : null)
  const shownFormError =
    formError ?? (preview === 'error' ? 'Can’t reach Bloodmatcher right now. Check your connection and try again.' : null)
  const shownEmail = sentTo || email.trim() || 'mara@example.com'
  const loading = shown === 'loading'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setInteracted(true)
    const problem = validateEmail(email)
    if (problem) {
      setFieldError(problem)
      setFormError(null)
      document.getElementById('fp-email')?.focus()
      return
    }
    const value = email.trim()
    setFieldError(null)
    setFormError(null)
    setStatus('loading')
    try {
      await (mockApi ? mockRequestPasswordReset(value) : requestPasswordReset(value))
      setSentTo(value)
      setStatus('success')
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setFieldError(err.message)
        setStatus('idle')
      } else {
        setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
        setStatus('error')
      }
    }
  }

  function startOver() {
    setInteracted(true)
    setStatus('idle')
    setFormError(null)
    setFieldError(null)
    setSentTo('')
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
              Locked
              <br />
              out?
            </h1>
            <p className="bm-script">we’ll get you back in</p>
            <div className="bm-dots" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => <span key={i} />)}
            </div>
            <p className="bm-tag">Together, we're stronger</p>
            <p className="bm-lede">
              Donors and hospitals both reset here. The link we send works once and expires after a short while.
            </p>
          </section>

          <section className="bm-card" aria-labelledby="fp-heading">
            {shown === 'success' ? (
              <div className="bm-success" role="status">
                <div className="bm-success-mark" aria-hidden="true">
                  <MailIcon />
                </div>
                <h2 id="fp-heading" className="bm-card-title">Check your inbox</h2>
                <p className="bm-success-body">
                  If an account exists for <strong>{shownEmail}</strong>, we’ve sent a link to choose a new
                  password. It can take a few minutes — check your spam folder too.
                </p>
                <div className="bm-success-actions">
                  <BmLink href="/login" onNavigate={onNavigate} className="bm-button">
                    Back to sign in
                  </BmLink>
                  <button type="button" className="bm-textbtn" onClick={startOver}>
                    Use a different email
                  </button>
                  {mockApi && onOpenResetLink && (
                    <button type="button" className="bm-textbtn" onClick={onOpenResetLink}>
                      Preview: open the emailed link
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <h2 id="fp-heading" className="bm-card-title">Reset your password</h2>
                <p className="bm-card-lede">Enter the email you registered with and we’ll send you a reset link.</p>

                <form className="bm-form" onSubmit={handleSubmit} noValidate>
                  <div className="bm-field">
                    <label htmlFor="fp-email">Email</label>
                    <input
                      id="fp-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setInteracted(true)
                        if (fieldError) setFieldError(null)
                        if (status === 'error') { setStatus('idle'); setFormError(null) }
                      }}
                      aria-invalid={!!shownFieldError}
                      aria-describedby={shownFieldError ? 'fp-email-error' : undefined}
                      disabled={loading}
                      required
                    />
                    {shownFieldError && (
                      <p id="fp-email-error" className="bm-field-error">{shownFieldError}</p>
                    )}
                  </div>

                  {shown === 'error' && shownFormError && (
                    <p className="bm-error" role="alert">{shownFormError}</p>
                  )}

                  <button type="submit" className="bm-button" disabled={loading} aria-busy={loading}>
                    {loading ? (
                      <>
                        <span className="bm-spinner" aria-hidden="true" /> Sending link…
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>

                  <p className="bm-register">
                    Remembered it? <BmLink href="/login" onNavigate={onNavigate}>Back to sign in</BmLink>
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

function MailIcon() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" aria-hidden="true">
      <rect x="1.5" y="1.5" width="19" height="15" rx="3" fill="#fff" stroke="var(--bm-ink)" strokeWidth="1.8" />
      <path d="M2.5 3.5 11 10l8.5-6.5" fill="none" stroke="var(--bm-red)" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}
