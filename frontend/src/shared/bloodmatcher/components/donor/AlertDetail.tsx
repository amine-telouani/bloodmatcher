import { UrgencyBloodBag } from '../../../../animation/shared/components/UrgencyBloodBag'
import { useState } from 'react'

import { ApiError } from '../../lib/api'
import { bloodLabel, formatAgo, STATUS_LABEL, URGENCY_LABEL } from '../../lib/blood'
import type { DonorAlert, donorApi } from '../../lib/donorApi'

type Props = {
  alert: DonorAlert
  api: typeof donorApi
  /** Set when the donor is still inside the gap after their last donation. */
  eligibleFrom: Date | null
  flash: string | null
  onResponded: (a: DonorAlert) => void
  onAuthFailed: (err: unknown) => boolean
}

type Answer = 'ACCEPTED' | 'DECLINED'

/** One request a donor was alerted to: what is needed, where, and their answer. */
export function AlertDetail({ alert: a, api, eligibleFrom, flash, onResponded, onAuthFailed }: Props) {
  const [saving, setSaving] = useState<Answer | null>(null)
  const [error, setError] = useState<string | null>(null)

  const open = a.status === 'OPEN'
  const going = a.response === 'ACCEPTED' || a.response === 'DONATED'
  const hasCoords = a.hospitalLatitude != null && a.hospitalLongitude != null
  const mapsUrl = hasCoords
      ? `https://www.google.com/maps/dir/?api=1&destination=${a.hospitalLatitude},${a.hospitalLongitude}`
      : null
  const tel = a.hospitalPhone ? `tel:${a.hospitalPhone.replace(/\s/g, '')}` : null
  const eligibleText = eligibleFrom?.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })

  async function answer(response: Answer) {
    setSaving(response)
    setError(null)
    try {
      const updated = await api.respond(a.requestId, response)
      onResponded(updated)
    } catch (err) {
      if (onAuthFailed(err)) return
      setError(err instanceof ApiError ? err.message : 'We couldn’t send your answer. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  const spinner = (label: string, dark = false) => (
      <>
        <span className={`bm-spinner ${dark ? 'bm-spinner--dark' : ''}`} aria-hidden="true" /> {label}
      </>
  )

  return (
      <section className="bm-card hd-card" aria-labelledby="dd-detail-title">
        {flash && (
            <p className="hd-flash" role="status">
              {flash}
            </p>
        )}

        <div className="hd-detail-head">
          {open && <span aria-hidden="true"><UrgencyBloodBag urgency={a.urgency} size="md" showLabel={false} emphasize /></span>}
          <span className={`hd-type hd-type--lg ${open ? '' : 'is-muted'}`}>{bloodLabel(a.bloodType)}</span>
          <div className="hd-detail-titles">
            <h2 id="dd-detail-title" className="hd-detail-title">
              {a.units} unit{a.units === 1 ? '' : 's'} of {bloodLabel(a.bloodType)} needed
            </h2>
            <p className="hd-detail-sub">
              {open ? (
                  <span className={`hd-urgency hd-urgency--${a.urgency.toLowerCase()}`}>{URGENCY_LABEL[a.urgency]}</span>
              ) : (
                  <span className={`hd-status hd-status--${a.status.toLowerCase()}`}>{STATUS_LABEL[a.status]}</span>
              )}
              {a.createdAt && <span>Posted {formatAgo(a.createdAt)}</span>}
            </p>
          </div>
        </div>

        <dl className="dd-where">
          <div>
            <dt>Hospital</dt>
            <dd>{a.hospitalName}</dd>
          </div>
          <div>
            <dt>Distance</dt>
            <dd>
              {a.distanceKm != null ? `${a.distanceKm.toFixed(1)} km · ` : ''}
              {a.hospitalCity}
            </dd>
          </div>
        </dl>

        {a.notes && <p className="hd-notes">{a.notes}</p>}

        {error && (
            <p className="bm-error dd-error" role="alert">
              {error}
            </p>
        )}

        {!open ? (
            <p className="dd-closed">
              {a.status === 'FULFILLED'
                  ? going
                      ? 'The hospital has what it needs. Thank you for answering.'
                      : 'The hospital has what it needs. No action is required.'
                  : 'The hospital cancelled this request. No action is required.'}
            </p>
        ) : a.response === 'PENDING' ? (
            <div className="dd-answer">
              {eligibleFrom ? (
                  <p className="dd-ineligible">
                    You can’t donate until {eligibleText}, 90 days after your last donation. Let the hospital know so they can
                    look elsewhere.
                  </p>
              ) : (
                  <button
                      type="button"
                      className="bm-button"
                      onClick={() => answer('ACCEPTED')}
                      disabled={saving !== null}
                      aria-busy={saving === 'ACCEPTED'}
                  >
                    {saving === 'ACCEPTED' ? spinner('Sending…') : 'I can donate'}
                  </button>
              )}
              <button
                  type="button"
                  className="bm-ghost"
                  onClick={() => answer('DECLINED')}
                  disabled={saving !== null}
                  aria-busy={saving === 'DECLINED'}
              >
                {saving === 'DECLINED' ? spinner('Sending…', true) : 'I can’t make it'}
              </button>
            </div>
        ) : a.response === 'DONATED' ? (
            <div className="dd-answer">
              <p className="dd-closed">Thank you. {a.hospitalName} has recorded your donation.</p>
            </div>
        ) : going ? (
            <div className="dd-going">
              <p className="dd-going-title">You’re expected at {a.hospitalName}.</p>
              <p>Contact the hospital for arrival instructions or if your plans change.</p>
              <div className="dd-links">
                {mapsUrl && (
                    <a className="bm-ghost" href={mapsUrl} target="_blank" rel="noreferrer">
                      Get directions
                    </a>
                )}
                {tel && (
                    <a className="hd-call" href={tel}>
                      {a.hospitalPhone}
                    </a>
                )}
              </div>
            </div>
        ) : (
            <div className="dd-answer">
              <p className="dd-closed">You told the hospital you can’t make it.</p>
            </div>
        )}
      </section>
  )
}