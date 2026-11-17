import React, { useRef, useState } from 'react'

import { BmLink, BmNav } from '../shared/components/BmNav'
import { apiUrl, ENDPOINTS } from '../shared/lib/api'
import { homeFor, normaliseRole, storeSession, type Role, type Session } from '../shared/lib/session'

import '../shared/styles/bloodmatch.css'
import './register.css'

export const args = {
  state: 'default',
  role: 'donor',
  mockApi: true,
}

export const argTypes = {
  state: { control: 'select', options: ['default', 'loading', 'error', 'success'] },
  role: { control: 'radio', options: ['donor', 'hospital'] },
  mockApi: { control: 'boolean' },
}

type Props = Partial<typeof args> & {
  onNavigate?: (path: string) => void
  /** Called with the new account's email once registration succeeds, so Sign in can prefill it. */
  onRegistered?: (email: string) => void
}

type Field =
  | 'email'
  | 'password'
  | 'name'
  | 'city'
  | 'fullName'
  | 'phone'
  | 'bloodType'
  | 'latitude'
  | 'longitude'

type Values = Record<Field, string>
type Errors = Partial<Record<Field, string>>

const EMPTY: Values = {
  email: '',
  password: '',
  name: '',
  city: '',
  fullName: '',
  phone: '',
  bloodType: '',
  latitude: '',
  longitude: '',
}

export default function Register(props: Props) {
  const { state, role: initialRole, mockApi, onNavigate, onRegistered } = { ...args, ...props }
  const [role, setRole] = useState<Role>(initialRole === 'hospital' ? 'hospital' : 'donor')
  const [values, setValues] = useState<Values>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [locating, setLocating] = useState<'idle' | 'locating' | 'failed'>('idle')
  const [session, setSession] = useState<Session | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const shown = status !== 'idle' ? status : state === 'default' ? 'idle' : state
  const loading = shown === 'loading'
  const clientErrors = validate(role, values)
  const errorFor = (f: Field) => serverErrors[f] ?? ((touched[f] || submitted) ? clientErrors[f] : undefined)
  const generalError =
    formError ?? (shown === 'error' && status === 'idle' ? 'We couldn’t create your account. Please try again.' : null)

  function update(f: Field, v: string) {
    setValues((prev) => ({ ...prev, [f]: v }))
    if (serverErrors[f]) setServerErrors((prev) => ({ ...prev, [f]: undefined }))
    if (formError) setFormError(null)
    if (status === 'error') setStatus('idle')
  }

  function blur(f: Field) {
    setTouched((prev) => ({ ...prev, [f]: true }))
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setLocating('failed')
      return
    }
    setLocating('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update('latitude', pos.coords.latitude.toFixed(6))
        update('longitude', pos.coords.longitude.toFixed(6))
        setTouched((prev) => ({ ...prev, latitude: true, longitude: true }))
        setLocating('idle')
      },
      () => setLocating('failed'),
      { timeout: 10000 }
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setSubmitted(true)
    setServerErrors({})
    setFormError(null)
    const errs = validate(role, values)
    const first = FIELD_ORDER[role].find((f) => errs[f])
    if (first) {
      focusField(formRef.current, first)
      return
    }
    setStatus('loading')
    const result = mockApi ? await mockRegister(role, values) : await register(role, values)
    if (result.ok) {
      if (result.session) storeSession(result.session)
      setSession(result.session)
      setStatus('success')
      onRegistered?.(values.email.trim())
      return
    }
    const fail = result as Extract<RegisterResult, { ok: false }>
    setStatus('error')
    setServerErrors(fail.fieldErrors)
    const firstServer = FIELD_ORDER[role].find((f) => fail.fieldErrors[f])
    if (firstServer) focusField(formRef.current, firstServer)
    else setFormError(fail.message)
  }

  return (
    <div className="bm-page">
      <div className="bm-panel">
        <BmNav active="/register" onNavigate={onNavigate} />

        <main className="bm-main bm-main--register">
          <Heart className="bm-heart bm-heart-1" />
          <Heart className="bm-heart bm-heart-2" />
          <Heart className="bm-heart bm-heart-3" />

          <section className="bm-intro">
            <h1 className="bm-title">
              Join the
              <br />
              match
            </h1>
            <p className="bm-script">one drop, the right place</p>
            <div className="bm-dots" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => <span key={i} />)}
            </div>
            <p className="bm-tag">{role === 'donor' ? 'Donors save lives nearby' : 'Reach donors in minutes'}</p>
            <p className="bm-lede">
              {role === 'donor'
                ? 'We’ll alert you only when a hospital near you needs your blood type.'
                : 'Post urgent requests and we’ll match them with compatible donors close by.'}
            </p>
          </section>

          <section className="bm-card bm-card--wide" aria-labelledby="register-heading">
            <h2 id="register-heading" className="bm-card-title">Create your account</h2>

            {shown === 'success' ? (
              <div className="bm-success bm-success--register" role="status">
                <p className="bm-success-title">
                  {role === 'hospital' ? 'Your hospital is registered.' : 'You’re registered as a donor.'}
                </p>
                <p>
                  {session
                    ? 'You’re signed in and ready to go.'
                    : 'Sign in with your new account to get started.'}
                </p>
                <dl className="bm-summary">
                  <div>
                    <dt>{role === 'hospital' ? 'Hospital' : 'Name'}</dt>
                    <dd>{(role === 'hospital' ? values.name : values.fullName).trim() || (role === 'hospital' ? 'St. Mary’s General' : 'Ana Ribeiro')}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{values.email.trim() || 'you@example.com'}</dd>
                  </div>
                  {role === 'donor' && (
                    <div>
                      <dt>Blood type</dt>
                      <dd>{BLOOD_TYPES.find((b) => b.value === values.bloodType)?.label ?? 'O+'}</dd>
                    </div>
                  )}
                </dl>
                <BmLink
                  href={session ? homeFor(session.role) : '/login'}
                  onNavigate={onNavigate}
                  className="bm-button"
                >
                  {session ? 'Continue to dashboard' : 'Sign in'}
                </BmLink>
              </div>
            ) : (
              <form ref={formRef} className="bm-form" onSubmit={handleSubmit} noValidate>
                <fieldset className="bm-roles" disabled={loading}>
                  <legend className="bm-legend">I’m registering as</legend>
                  {ROLES.map((r) => (
                    <label key={r.value} className={`bm-role ${role === r.value ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={role === r.value}
                        onChange={() => {
                          setRole(r.value)
                          setServerErrors({})
                          setFormError(null)
                          if (status === 'error') setStatus('idle')
                        }}
                      />
                      <span className="bm-role-name">{r.label}</span>
                      <span className="bm-role-desc">{r.desc}</span>
                    </label>
                  ))}
                </fieldset>

                <div className="bm-grid">
                  <TextField
                    id="email" label="Email" type="email" autoComplete="email" placeholder={role === 'hospital' ? 'bloodbank@hospital.org' : 'you@example.com'}
                    value={values.email} error={errorFor('email')} disabled={loading}
                    onChange={(v) => update('email', v)} onBlur={() => blur('email')}
                  />

                  <div className="bm-field">
                    <label htmlFor="reg-password">Password</label>
                    <div className="bm-input-wrap">
                      <input
                        id="reg-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={values.password}
                        onChange={(e) => update('password', e.target.value)}
                        onBlur={() => blur('password')}
                        aria-invalid={!!errorFor('password')}
                        aria-describedby={errorFor('password') ? 'reg-password-error' : 'reg-password-hint'}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="bm-reveal"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-pressed={showPassword}
                        disabled={loading}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {errorFor('password') ? (
                      <p id="reg-password-error" className="bm-field-error">{errorFor('password')}</p>
                    ) : (
                      <p id="reg-password-hint" className="bm-hint">8+ characters, with a letter and a number.</p>
                    )}
                  </div>

                  {role === 'hospital' ? (
                    <>
                      <TextField
                        id="name" label="Hospital name" autoComplete="organization" placeholder="St. Mary’s General"
                        value={values.name} error={errorFor('name')} disabled={loading}
                        onChange={(v) => update('name', v)} onBlur={() => blur('name')}
                      />
                      <TextField
                        id="city" label="City" autoComplete="address-level2" placeholder="Lisbon"
                        value={values.city} error={errorFor('city')} disabled={loading}
                        onChange={(v) => update('city', v)} onBlur={() => blur('city')}
                      />
                    </>
                  ) : (
                    <>
                      <TextField
                        id="fullName" label="Full name" autoComplete="name" placeholder="Ana Ribeiro"
                        value={values.fullName} error={errorFor('fullName')} disabled={loading}
                        onChange={(v) => update('fullName', v)} onBlur={() => blur('fullName')}
                      />
                      <TextField
                        id="phone" label="Phone" type="tel" autoComplete="tel" placeholder="+351 912 345 678"
                        value={values.phone} error={errorFor('phone')} disabled={loading}
                        onChange={(v) => update('phone', v)} onBlur={() => blur('phone')}
                      />
                    </>
                  )}
                </div>

                {role === 'donor' && (
                  <fieldset
                    className="bm-blood"
                    disabled={loading}
                    aria-describedby={errorFor('bloodType') ? 'reg-bloodType-error' : undefined}
                  >
                    <legend className="bm-legend">Blood type</legend>
                    <div className="bm-blood-grid">
                      {BLOOD_TYPES.map((b) => (
                        <label key={b.value} className={`bm-chip ${values.bloodType === b.value ? 'is-selected' : ''}`}>
                          <input
                            type="radio"
                            name="bloodType"
                            value={b.value}
                            checked={values.bloodType === b.value}
                            onChange={() => { update('bloodType', b.value); blur('bloodType') }}
                          />
                          {b.label}
                        </label>
                      ))}
                    </div>
                    {errorFor('bloodType') && (
                      <p id="reg-bloodType-error" className="bm-field-error">{errorFor('bloodType')}</p>
                    )}
                  </fieldset>
                )}

                <fieldset className="bm-location" disabled={loading}>
                  <div className="bm-location-head">
                    <legend className="bm-legend">
                      {role === 'hospital' ? 'Hospital location' : 'Where you usually are'}
                    </legend>
                    <button type="button" className="bm-ghost" onClick={useMyLocation} disabled={locating === 'locating'}>
                      {locating === 'locating' ? (
                        <><span className="bm-spinner bm-spinner--dark" aria-hidden="true" /> Locating…</>
                      ) : (
                        'Use my location'
                      )}
                    </button>
                  </div>
                  {locating === 'failed' && (
                    <p className="bm-hint" role="status">
                      We couldn’t get your location. Enter the coordinates instead.
                    </p>
                  )}
                  <div className="bm-grid">
                    <TextField
                      id="latitude" label="Latitude" inputMode="decimal" placeholder="38.7223"
                      value={values.latitude} error={errorFor('latitude')} disabled={loading}
                      onChange={(v) => update('latitude', v)} onBlur={() => blur('latitude')}
                    />
                    <TextField
                      id="longitude" label="Longitude" inputMode="decimal" placeholder="-9.1393"
                      value={values.longitude} error={errorFor('longitude')} disabled={loading}
                      onChange={(v) => update('longitude', v)} onBlur={() => blur('longitude')}
                    />
                  </div>
                </fieldset>

                {generalError && (
                  <p className="bm-error" role="alert">{generalError}</p>
                )}

                <button type="submit" className="bm-button" disabled={loading} aria-busy={loading}>
                  {loading ? (
                    <><span className="bm-spinner" aria-hidden="true" /> Creating account…</>
                  ) : role === 'hospital' ? (
                    'Register hospital'
                  ) : (
                    'Register as donor'
                  )}
                </button>

                <p className="bm-register">
                  Already have an account?{' '}
                  <BmLink href="/login" onNavigate={onNavigate}>Sign in</BmLink>
                </p>
              </form>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

/* ---------- Field ---------- */

type TextFieldProps = {
  id: Field
  label: string
  value: string
  error?: string
  onChange: (v: string) => void
  onBlur: () => void
  type?: string
  autoComplete?: string
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  disabled?: boolean
}

function TextField({ id, label, value, error, onChange, onBlur, type = 'text', ...rest }: TextFieldProps) {
  const inputId = `reg-${id}`
  return (
    <div className="bm-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && <p id={`${inputId}-error`} className="bm-field-error">{error}</p>}
    </div>
  )
}

function Heart({ className }: { className: string }) {
  return (
    <svg className={className} width="18" height="16" viewBox="0 0 18 16" aria-hidden="true">
      <path
        d="M9 14.5S1.5 10 1.5 5.2A3.7 3.7 0 0 1 9 3.6a3.7 3.7 0 0 1 7.5 1.6C16.5 10 9 14.5 9 14.5Z"
        fill="none"
        stroke="var(--bm-ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------- Data & validation ---------- */

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: 'donor', label: 'Donor', desc: 'Get alerts when someone nearby needs your type' },
  { value: 'hospital', label: 'Hospital', desc: 'Post urgent requests and find matching donors' },
]

/** Values are the Spring enum names; labels are what people read. */
const BLOOD_TYPES = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A−' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B−' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB−' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O−' },
]

const FIELD_ORDER: Record<Role, Field[]> = {
  hospital: ['email', 'password', 'name', 'city', 'latitude', 'longitude'],
  donor: ['email', 'password', 'fullName', 'phone', 'bloodType', 'latitude', 'longitude'],
}

function validate(role: Role, v: Values): Errors {
  const e: Errors = {}
  if (!v.email.trim()) e.email = 'Enter your email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Enter a valid email, like name@example.com.'

  if (!v.password) e.password = 'Choose a password.'
  else if (v.password.length < 8) e.password = 'Use at least 8 characters.'
  else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) e.password = 'Include at least one letter and one number.'

  if (role === 'hospital') {
    if (!v.name.trim()) e.name = 'Enter the hospital’s name.'
    if (!v.city.trim()) e.city = 'Enter the city.'
  } else {
    if (!v.fullName.trim()) e.fullName = 'Enter your full name.'
    if (!v.phone.trim()) e.phone = 'Enter a phone number so hospitals can reach you.'
    else if (!/^\+?[\d\s()-]{7,20}$/.test(v.phone.trim())) e.phone = 'Enter a valid phone number.'
    if (!v.bloodType) e.bloodType = 'Choose your blood type.'
  }

  const lat = parseCoord(v.latitude)
  const lng = parseCoord(v.longitude)
  if (v.latitude.trim() === '') e.latitude = 'Enter a latitude.'
  else if (lat === null || lat < -90 || lat > 90) e.latitude = 'Latitude must be between −90 and 90.'
  if (v.longitude.trim() === '') e.longitude = 'Enter a longitude.'
  else if (lng === null || lng < -180 || lng > 180) e.longitude = 'Longitude must be between −180 and 180.'
  return e
}

function parseCoord(s: string): number | null {
  const t = s.trim()
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null
  return Number(t)
}

function focusField(form: HTMLFormElement | null, f: Field) {
  const el = form?.querySelector<HTMLInputElement>(`[name="${f}"]`)
  el?.focus()
}

/* ---------- API ---------- */

type RegisterResult =
  | { ok: true; session: Session | null }
  | { ok: false; fieldErrors: Errors; message: string }


function payload(role: Role, v: Values) {
  const location = { latitude: Number(v.latitude), longitude: Number(v.longitude) }
  if (role === 'hospital') {
    return { role: 'HOSPITAL', email: v.email.trim(), password: v.password, name: v.name.trim(), city: v.city.trim(), ...location }
  }
  return {
    role: 'DONOR',
    email: v.email.trim(),
    password: v.password,
    fullName: v.fullName.trim(),
    phone: v.phone.trim(),
    bloodType: v.bloodType,
    ...location,
  }
}

async function register(role: Role, v: Values): Promise<RegisterResult> {
  let res: Response
  try {
    res = await fetch(apiUrl(ENDPOINTS.register), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload(role, v)),
    })
  } catch {
    return { ok: false, fieldErrors: {}, message: 'Can’t reach Bloodmatcher right now. Check your connection and try again.' }
  }

  const body = await res.json().catch(() => null)

  if (res.ok) {
    const r = normaliseRole(body?.role) ?? role
    return { ok: true, session: body?.token ? { token: body.token, role: r, user: body.user ?? null } : null }
  }
  if (res.status === 409) {
    return { ok: false, fieldErrors: { email: 'An account with this email already exists.' }, message: '' }
  }
  if (res.status === 400) {
    const fieldErrors = readFieldErrors(body)
    return {
      ok: false,
      fieldErrors,
      message: body?.message ?? 'Some details need fixing. Check the highlighted fields.',
    }
  }
  return { ok: false, fieldErrors: {}, message: 'Something went wrong on our side. Please try again in a moment.' }
}

/** Reads Spring validation errors: `{ errors: { field: msg } }`, `{ fieldErrors|errors: [{ field, message|defaultMessage }] }`. */
function readFieldErrors(body: any): Errors {
  const out: Errors = {}
  const src = body?.fieldErrors ?? body?.errors
  if (Array.isArray(src)) {
    for (const item of src) {
      if (item?.field) out[item.field as Field] = item.message ?? item.defaultMessage ?? 'Check this field.'
    }
  } else if (src && typeof src === 'object') {
    for (const [k, msg] of Object.entries(src)) out[k as Field] = String(msg)
  }
  return out
}

/**
 * Preview stand-in for the API, mirroring Spring's responses:
 * an email starting with "taken" is a 409, one starting with "down" is a 500,
 * anything else registers without a token, like a backend that asks you to sign in next.
 */
function mockRegister(_role: Role, v: Values): Promise<RegisterResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const email = v.email.trim().toLowerCase()
      if (email.startsWith('taken')) {
        resolve({ ok: false, fieldErrors: { email: 'An account with this email already exists.' }, message: '' })
        return
      }
      if (email.startsWith('down')) {
        resolve({ ok: false, fieldErrors: {}, message: 'Something went wrong on our side. Please try again in a moment.' })
        return
      }
      resolve({ ok: true, session: null })
    }, 1100)
  })
}
