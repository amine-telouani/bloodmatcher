import { useEffect, useRef, useState, type FormEvent } from 'react'

import { ApiError } from '../../lib/api'
import { bloodLabel } from '../../lib/blood'
import type { DonorProfile, donorApi } from '../../lib/donorApi'

type Props = {
  profile: DonorProfile
  api: typeof donorApi
  onSaved: (p: DonorProfile) => void
  onAuthFailed: (err: unknown) => boolean
}

type Field = 'fullName' | 'phone' | 'latitude' | 'longitude'
type Values = Record<Field, string>
type Errors = { [K in Field]?: string | undefined }
type Touched = { [K in Field]?: boolean | undefined }

/** Editable donor details, styled like the registration form. Blood type and name are fixed. */
export function DonorProfileForm({ profile, api, onSaved, onAuthFailed }: Props) {
  const [values, setValues] = useState<Values>({
    fullName: profile.fullName,
    phone: profile.phone,
    latitude: String(profile.latitude),
    longitude: String(profile.longitude),
  })
  const [touched, setTouched] = useState<Touched>({})
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState<string | null>(null)
  const [locating, setLocating] = useState<'idle' | 'locating' | 'failed'>('idle')
  const formRef = useRef<HTMLFormElement>(null)

  const clientErrors = validate(values)
  const errorFor = (f: Field) => serverErrors[f] ?? ((touched[f] || submitted) ? clientErrors[f] : undefined)

  // clear the success message after a moment
  useEffect(() => {
    if (!savedFlash) return
    const t = setTimeout(() => setSavedFlash(null), 4000)
    return () => clearTimeout(t)
  }, [savedFlash])

  function update(f: Field, v: string) {
    setValues((prev) => ({ ...prev, [f]: v }))
    if (serverErrors[f]) setServerErrors((prev) => ({ ...prev, [f]: undefined }))
    if (formError) setFormError(null)
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (saving) return
    setSubmitted(true)
    setServerErrors({})
    setFormError(null)
    const errs = validate(values)
    const first = (['fullName', 'phone', 'latitude', 'longitude'] as Field[]).find((f) => errs[f])
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setSaving(true)
    try {
      const saved = await api.updateProfile({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
      })
      onSaved(saved)
      setSavedFlash('Profile saved.')
    } catch (err) {
      if (onAuthFailed(err)) return
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
        setServerErrors(err.fieldErrors as Errors)
        const firstServer = (['fullName', 'phone', 'latitude', 'longitude'] as Field[]).find((f) => err.fieldErrors[f])
        if (firstServer) formRef.current?.querySelector<HTMLElement>(`[name="${firstServer}"]`)?.focus()
      } else {
        setFormError(err instanceof ApiError ? err.message : 'We couldn’t save your profile. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
      <section className="bm-card dd-profile" aria-labelledby="dd-profile-title">
        <h2 id="dd-profile-title" className="bm-card-title">Profile</h2>

        {savedFlash && (
            <p className="hd-flash" role="status">
              {savedFlash}
            </p>
        )}

        <form ref={formRef} className="bm-form" onSubmit={handleSubmit} noValidate>
          <div className="bm-grid">
            <div className="bm-field">
              <label htmlFor="ddp-fullName">Full name</label>
              <input
                  id="ddp-fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Ana Ribeiro"
                  value={values.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  onBlur={() => blur('fullName')}
                  aria-invalid={!!errorFor('fullName')}
                  aria-describedby={errorFor('fullName') ? 'ddp-fullName-error' : undefined}
                  disabled
              />
              {errorFor('fullName') && <p id="ddp-fullName-error" className="bm-field-error">{errorFor('fullName')}</p>}
            </div>

            <div className="bm-field">
              <label htmlFor="ddp-phone">Phone</label>
              <input
                  id="ddp-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+351 912 345 678"
                  value={values.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  onBlur={() => blur('phone')}
                  aria-invalid={!!errorFor('phone')}
                  aria-describedby={errorFor('phone') ? 'ddp-phone-error' : undefined}
                  disabled={saving}
              />
              {errorFor('phone') && <p id="ddp-phone-error" className="bm-field-error">{errorFor('phone')}</p>}
            </div>
          </div>

          <div className="bm-field">
            <label htmlFor="ddp-bloodType">Blood type</label>
            <input
                id="ddp-bloodType"
                type="text"
                value={bloodLabel(profile.bloodType)}
                readOnly
                disabled
                aria-describedby="ddp-bloodType-hint"
            />
            <p id="ddp-bloodType-hint" className="bm-hint">Your blood type can’t be changed here.</p>
          </div>

          <div className="bm-field">
            <div className="bm-label-row">
              <label>Where you usually are</label>
              <button type="button" className="bm-ghost" onClick={useMyLocation} disabled={saving || locating === 'locating'}>
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
              <div className="bm-field">
                <label htmlFor="ddp-latitude">Latitude</label>
                <input
                    id="ddp-latitude"
                    name="latitude"
                    type="text"
                    inputMode="decimal"
                    placeholder="38.7223"
                    value={values.latitude}
                    onChange={(e) => update('latitude', e.target.value)}
                    onBlur={() => blur('latitude')}
                    aria-invalid={!!errorFor('latitude')}
                    aria-describedby={errorFor('latitude') ? 'ddp-latitude-error' : undefined}
                    disabled={saving}
                />
                {errorFor('latitude') && <p id="ddp-latitude-error" className="bm-field-error">{errorFor('latitude')}</p>}
              </div>
              <div className="bm-field">
                <label htmlFor="ddp-longitude">Longitude</label>
                <input
                    id="ddp-longitude"
                    name="longitude"
                    type="text"
                    inputMode="decimal"
                    placeholder="-9.1393"
                    value={values.longitude}
                    onChange={(e) => update('longitude', e.target.value)}
                    onBlur={() => blur('longitude')}
                    aria-invalid={!!errorFor('longitude')}
                    aria-describedby={errorFor('longitude') ? 'ddp-longitude-error' : undefined}
                    disabled={saving}
                />
                {errorFor('longitude') && <p id="ddp-longitude-error" className="bm-field-error">{errorFor('longitude')}</p>}
              </div>
            </div>
          </div>

          {formError && <p className="bm-error" role="alert">{formError}</p>}

          <button type="submit" className="bm-button" disabled={saving} aria-busy={saving}>
            {saving ? (
                <><span className="bm-spinner" aria-hidden="true" /> Saving…</>
            ) : (
                'Save profile'
            )}
          </button>
        </form>
      </section>
  )
}

/* ---------- validation (same rules as registration) ---------- */

function validate(v: Values): Errors {
  const e: Errors = {}
  if (!v.fullName.trim()) e.fullName = 'Enter your full name.'
  if (!v.phone.trim()) e.phone = 'Enter a phone number so hospitals can reach you.'
  else if (!/^\+?[\d\s()-]{7,20}$/.test(v.phone.trim())) e.phone = 'Enter a valid phone number.'

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