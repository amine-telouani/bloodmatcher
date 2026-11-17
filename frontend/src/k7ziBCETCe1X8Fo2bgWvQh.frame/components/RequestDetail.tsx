import React, { useCallback, useEffect, useState } from 'react'

import { ApiError } from '../../shared/lib/api'
import { bloodLabel, formatAgo, STATUS_LABEL, URGENCY_LABEL, type RequestStatus } from '../../shared/lib/blood'
import type { BloodRequest, DonorMatch, hospitalApi } from '../../shared/lib/hospitalApi'

type Props = {
  request: BloodRequest
  api: typeof hospitalApi
  flash: string | null
  onUpdated: (req: BloodRequest) => void
  onAuthFailed: (err: unknown) => boolean
}

const RESPONSE_LABEL = { ACCEPTED: 'Coming in', PENDING: 'Alerted', DECLINED: 'Can’t make it' }

/** One request: its details, status actions, and the compatible donors matched to it. */
export function RequestDetail({ request: r, api, flash, onUpdated, onAuthFailed }: Props) {
  const [matches, setMatches] = useState<DonorMatch[]>([])
  const [load, setLoad] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadError, setLoadError] = useState('')
  const [confirming, setConfirming] = useState<RequestStatus | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    setLoad('loading')
    try {
      setMatches(await api.matches(r.id))
      setLoad('ready')
    } catch (err) {
      if (onAuthFailed(err)) return
      setLoadError(err instanceof ApiError ? err.message : 'We couldn’t load matched donors.')
      setLoad('error')
    }
  }, [api, r.id, onAuthFailed])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  async function changeStatus(status: RequestStatus) {
    setSaving(true)
    setActionError(null)
    try {
      const updated = await api.setStatus(r.id, status)
      setConfirming(null)
      onUpdated(updated)
    } catch (err) {
      if (onAuthFailed(err)) return
      setActionError(err instanceof ApiError ? err.message : 'We couldn’t update this request. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const accepted = matches.filter((m) => m.response === 'ACCEPTED').length
  const open = r.status === 'OPEN'

  return (
    <section className="bm-card hd-card" aria-labelledby="hd-detail-title">
      {flash && (
        <p className="hd-flash" role="status">
          {flash}
        </p>
      )}

      <div className="hd-detail-head">
        <span className={`hd-type hd-type--lg ${open ? '' : 'is-muted'}`}>{bloodLabel(r.bloodType)}</span>
        <div className="hd-detail-titles">
          <h2 id="hd-detail-title" className="hd-detail-title">
            {r.units} unit{r.units === 1 ? '' : 's'} of {bloodLabel(r.bloodType)}
          </h2>
          <p className="hd-detail-sub">
            {open ? (
              <span className={`hd-urgency hd-urgency--${r.urgency.toLowerCase()}`}>{URGENCY_LABEL[r.urgency]}</span>
            ) : (
              <span className={`hd-status hd-status--${r.status.toLowerCase()}`}>{STATUS_LABEL[r.status]}</span>
            )}
            <span>Posted {formatAgo(r.createdAt)}</span>
          </p>
        </div>
      </div>

      {r.notes && <p className="hd-notes">{r.notes}</p>}

      {open && (
        <div className="hd-actions">
          {confirming ? (
            <div className="hd-confirm" role="alertdialog" aria-labelledby="hd-confirm-q">
              <p id="hd-confirm-q" className="hd-confirm-q">
                {confirming === 'CANCELLED'
                  ? 'Cancel this request? Alerted donors will be told it’s no longer needed.'
                  : 'Mark as fulfilled? Donors who haven’t come in yet will be told they’re no longer needed.'}
              </p>
              {actionError && <p className="bm-error" role="alert">{actionError}</p>}
              <div className="hd-confirm-btns">
                <button
                  type="button"
                  className={`bm-button ${confirming === 'CANCELLED' ? 'hd-danger' : ''}`}
                  onClick={() => changeStatus(confirming)}
                  disabled={saving}
                  aria-busy={saving}
                >
                  {saving ? (
                    <>
                      <span className="bm-spinner" aria-hidden="true" /> Updating…
                    </>
                  ) : confirming === 'CANCELLED' ? (
                    'Yes, cancel request'
                  ) : (
                    'Yes, mark fulfilled'
                  )}
                </button>
                <button
                  type="button"
                  className="bm-ghost"
                  onClick={() => {
                    setConfirming(null)
                    setActionError(null)
                  }}
                  disabled={saving}
                >
                  Keep it open
                </button>
              </div>
            </div>
          ) : (
            <>
              <button type="button" className="bm-ghost" onClick={() => setConfirming('FULFILLED')}>
                Mark fulfilled
              </button>
              <button type="button" className="hd-text-danger" onClick={() => setConfirming('CANCELLED')}>
                Cancel request
              </button>
            </>
          )}
        </div>
      )}

      <div className="hd-matches">
        <div className="hd-matches-head">
          <h3 className="hd-matches-title">Matched donors</h3>
          {load === 'ready' && matches.length > 0 && (
            <span className="bm-hint">
              {accepted} of {matches.length} coming in
            </span>
          )}
        </div>

        {load === 'loading' ? (
          <ul className="hd-donors" aria-busy="true" aria-label="Loading donors">
            {[0, 1, 2].map((i) => (
              <li key={i} className="hd-donor">
                <span className="hd-skel hd-skel--line" />
                <span className="hd-skel hd-skel--short" />
              </li>
            ))}
          </ul>
        ) : load === 'error' ? (
          <div className="hd-inline-problem" role="alert">
            <p>{loadError}</p>
            <button type="button" className="bm-ghost" onClick={fetchMatches}>
              Try again
            </button>
          </div>
        ) : matches.length === 0 ? (
          <p className="hd-donors-empty">
            No compatible donors within 25 km yet.{' '}
            {open ? 'We’ll alert new donors as soon as they join.' : ''}
          </p>
        ) : (
          <ul className="hd-donors">
            {matches.map((m) => (
              <li key={m.donorId} className="hd-donor">
                <div className="hd-donor-main">
                  <span className="hd-donor-name">{m.fullName}</span>
                  <span className="hd-donor-meta">
                    {bloodLabel(m.bloodType)} · {m.distanceKm.toFixed(1)} km away
                  </span>
                </div>
                <div className="hd-donor-side">
                  <span className={`hd-resp hd-resp--${m.response.toLowerCase()}`}>{RESPONSE_LABEL[m.response]}</span>
                  {m.response === 'ACCEPTED' && (
                    <a className="hd-call" href={`tel:${m.phone.replace(/\s/g, '')}`}>
                      {m.phone}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
