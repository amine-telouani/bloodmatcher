import React, { useState } from 'react'

import { ApiError } from '../../shared/lib/api'
import { bloodLabel, formatAgo, STATUS_LABEL, URGENCY_LABEL } from '../../shared/lib/blood'
import type { DonorAlert, donorApi } from '../../shared/lib/donorApi'

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
  const [withdrawing, setWithdrawing] = useState(false)

  const open = a.status === 'OPEN'
  const going = a.response === 'ACCEPTED'
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${a.hospitalLatitude},${a.hospitalLongitude}`
  const tel = `tel:${a.hospitalPhone.replace(/\s/g, '')}`
  const eligibleText = eligibleFrom?.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })

  async function answer(response: Answer) {
    setSaving(response)
    setError(null)
    try {
      const updated = await api.respond(a.requestId, response)
      setWithdrawing(false)
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
            <span>Posted {formatAgo(a.createdAt)}</span>
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
            {a.distanceKm.toFixed(1)} km · {a.hospitalCity}
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
              You can’t donate until {eligibleText}, 56 days after your last donation. Let the hospital know so they can
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
      ) : going ? (
        <div className="dd-going">
          <p className="dd-going-title">You’re expected at {a.hospitalName}.</p>
          <p>Bring photo ID and go to the blood bank reception. Call if your plans change on the way.</p>
          <div className="dd-links">
            <a className="bm-ghost" href={mapsUrl} target="_blank" rel="noreferrer">
              Get directions
            </a>
            <a className="hd-call" href={tel}>
              {a.hospitalPhone}
            </a>
          </div>
          {withdrawing ? (
            <div className="hd-confirm" role="alertdialog" aria-labelledby="dd-withdraw-q">
              <p id="dd-withdraw-q" className="hd-confirm-q">
                Tell {a.hospitalName} you can no longer come?
              </p>
              <div className="hd-confirm-btns">
                <button
                  type="button"
                  className="bm-button hd-danger"
                  onClick={() => answer('DECLINED')}
                  disabled={saving !== null}
                  aria-busy={saving === 'DECLINED'}
                >
                  {saving === 'DECLINED' ? spinner('Sending…') : 'Yes, I can’t come'}
                </button>
                <button type="button" className="bm-ghost" onClick={() => setWithdrawing(false)} disabled={saving !== null}>
                  I’m still coming
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="hd-text-danger dd-withdraw" onClick={() => setWithdrawing(true)}>
              I can no longer come
            </button>
          )}
        </div>
      ) : (
        <div className="dd-answer">
          <p className="dd-closed">You told the hospital you can’t make it.</p>
          {!eligibleFrom && (
            <button
              type="button"
              className="bm-ghost"
              onClick={() => answer('ACCEPTED')}
              disabled={saving !== null}
              aria-busy={saving === 'ACCEPTED'}
            >
              {saving === 'ACCEPTED' ? spinner('Sending…', true) : 'I can come after all'}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
