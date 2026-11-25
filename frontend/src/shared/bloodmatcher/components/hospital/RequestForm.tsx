
import { useRef, useState } from 'react'

import { ApiError } from '../../lib/api'
import { BLOOD_TYPES, URGENCY_LABEL, type BloodType, type Urgency } from '../../lib/blood'
import type { BloodRequest, hospitalApi } from '../../lib/hospitalApi'

type Props = {
  api: typeof hospitalApi
  onCreated: (req: BloodRequest) => void
  /** Returns true when it handled the error (an expired session). */
  onAuthFailed: (err: unknown) => boolean
  onCancel?: (() => void) | undefined
}

type Errors = Partial<Record<'bloodType' | 'units' | 'urgency', string>>

const URGENCIES: { value: Urgency; hint: string }[] = [
  { value: 'CRITICAL', hint: 'Needed within hours' },
  { value: 'URGENT', hint: 'Needed today' },
  { value: 'NORMAL', hint: 'Needed within 24 hours' },
]

/** Post a new urgent blood request. */
export function RequestForm({ api, onCreated, onAuthFailed, onCancel }: Props) {
  const [bloodType, setBloodType] = useState<BloodType | ''>('')
  const [units, setUnits] = useState('1')
  const [urgency, setUrgency] = useState<Urgency>('URGENT')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverErrors, setServerErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const errors: Errors = { ...(submitted ? validate() : {}), ...serverErrors }

  function validate(): Errors {
    const e: Errors = {}
    if (!bloodType) e.bloodType = 'Choose the blood type you need.'
    const n = Number(units)
    if (!/^\d+$/.test(units.trim())) e.units = 'Enter a whole number of units.'
    else if (n < 1 || n > 20) e.units = 'Request between 1 and 20 units.'
    return e
  }

  function touch() {
    if (serverErrors) setServerErrors({})
    if (formError) setFormError(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSubmitted(true)
    const errs = validate()
    const first = (['bloodType', 'units'] as const).find((f) => errs[f])
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const req = await api.create({ bloodType: bloodType as BloodType, units: Number(units), urgency, notes: '' })
      onCreated(req)
    } catch (err) {
      if (onAuthFailed(err)) return
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setServerErrors(err.fieldErrors as Errors)
      else setFormError(err instanceof ApiError ? err.message : 'We couldn’t post this request. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bm-card hd-card" aria-labelledby="hd-new-title">
      <h2 id="hd-new-title" className="bm-card-title">New urgent request</h2>
      <p className="hd-card-lede">The search starts within 5 km and can widen to 60 km as needed.</p>

      <form ref={formRef} className="bm-form" onSubmit={submit} noValidate>
        <fieldset className="bm-blood" disabled={saving} aria-describedby={errors.bloodType ? 'hd-bt-error' : undefined}>
          <legend className="bm-legend">Blood type needed</legend>
          <div className="bm-blood-grid hd-blood-grid">
            {BLOOD_TYPES.map((b) => (
              <label key={b.value} className={`bm-chip ${bloodType === b.value ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="bloodType"
                  value={b.value}
                  checked={bloodType === b.value}
                  onChange={() => {
                    setBloodType(b.value)
                    touch()
                  }}
                />
                {b.label}
              </label>
            ))}
          </div>
          {errors.bloodType && <p id="hd-bt-error" className="bm-field-error">{errors.bloodType}</p>}
        </fieldset>

        <div className="bm-field hd-units-field">
          <label htmlFor="hd-units">Units</label>
          <input
            id="hd-units"
            name="units"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={units}
            onChange={(e) => {
              setUnits(e.target.value)
              touch()
            }}
            aria-invalid={!!errors.units}
            aria-describedby={errors.units ? 'hd-units-error' : 'hd-units-hint'}
            disabled={saving}
          />
          {errors.units ? (
            <p id="hd-units-error" className="bm-field-error">{errors.units}</p>
          ) : (
            <p id="hd-units-hint" className="bm-hint">One unit is about 450 ml.</p>
          )}
        </div>

        <fieldset className="hd-urgency-set" disabled={saving}>
          <legend className="bm-legend">Urgency</legend>
          <div className="hd-urgency-grid">
            {URGENCIES.map((u) => (
              <label key={u.value} className={`hd-urgency-opt ${urgency === u.value ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="urgency"
                  value={u.value}
                  checked={urgency === u.value}
                  onChange={() => {
                    setUrgency(u.value)
                    touch()
                  }}
                />
                <span className="hd-urgency-name">{URGENCY_LABEL[u.value]}</span>
                <span className="hd-urgency-hint">{u.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {formError && <p className="bm-error" role="alert">{formError}</p>}

        <div className="hd-form-actions">
          <button type="submit" className="bm-button" disabled={saving} aria-busy={saving}>
            {saving ? (
              <>
                <span className="bm-spinner" aria-hidden="true" /> Posting…
              </>
            ) : (
              'Post request'
            )}
          </button>
          {onCancel && (
            <button type="button" className="bm-ghost hd-cancel" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  )
}

