import { useState } from 'react'
import { UrgencyBloodBag } from '../../../../animation/shared/components/UrgencyBloodBag'
import { ApiError } from '../../lib/api'
import { bloodLabel, formatAgo, STATUS_LABEL, URGENCY_LABEL } from '../../lib/blood'
import type { BloodRequest, hospitalApi } from '../../lib/hospitalApi'

type Props = {
  request: BloodRequest
  api: typeof hospitalApi
  flash: string | null
  onUpdated: (request: BloodRequest) => void
  onAuthFailed: (error: unknown) => boolean
}

/** The current request state and actions available through the hospital API. */
export function RequestDetail({ request, api, flash, onUpdated, onAuthFailed }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const open = request.status === 'OPEN'
  const deadline = request.deadline ? new Date(request.deadline) : null

  async function cancel() {
    setSaving(true)
    setError(null)
    try {
      const cancelled = await api.setStatus(request.id, 'CANCELLED')
      setConfirming(false)
      onUpdated(cancelled)
    } catch (error) {
      if (!onAuthFailed(error)) {
        setError(error instanceof ApiError ? error.message : 'We couldn’t cancel this request. Try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bm-card hd-card" aria-labelledby="hd-detail-title">
      {flash && <p className="hd-flash" role="status">{flash}</p>}
      <div className="hd-detail-head">
        {open && <span aria-hidden="true"><UrgencyBloodBag urgency={request.urgency} showLabel={false} emphasize /></span>}
        <span className={`hd-type hd-type--lg ${open ? '' : 'is-muted'}`}>{bloodLabel(request.bloodType)}</span>
        <div className="hd-detail-titles">
          <h2 id="hd-detail-title" className="hd-detail-title">
            {request.units} unit{request.units === 1 ? '' : 's'} of {bloodLabel(request.bloodType)}
          </h2>
          <p className="hd-detail-sub">
            {open ? (
              <span className={`hd-urgency hd-urgency--${request.urgency.toLowerCase()}`}>{URGENCY_LABEL[request.urgency]}</span>
            ) : (
              <span className={`hd-status hd-status--${request.status.toLowerCase()}`}>{STATUS_LABEL[request.status]}</span>
            )}
            <span>Posted {formatAgo(request.createdAt)}</span>
          </p>
        </div>
      </div>

      <dl className="dd-where">
        {request.currentRadiusKm != null && (
          <div><dt>Search radius</dt><dd>{request.currentRadiusKm} km</dd></div>
        )}
        {deadline && Number.isFinite(deadline.getTime()) && (
          <div>
            <dt>Response deadline</dt>
            <dd><time dateTime={request.deadline}>{deadline.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</time></dd>
          </div>
        )}
      </dl>

      {open && (
        <div className="hd-actions">
          {confirming ? (
            <div className="hd-confirm" aria-labelledby="hd-confirm-q">
              <p id="hd-confirm-q" className="hd-confirm-q">Cancel this blood request?</p>
              {error && <p className="bm-error" role="alert">{error}</p>}
              <div className="hd-confirm-btns">
                <button type="button" className="bm-button hd-danger" onClick={cancel} disabled={saving}>
                  {saving ? 'Cancelling…' : 'Yes, cancel request'}
                </button>
                <button type="button" className="bm-ghost" onClick={() => { setConfirming(false); setError(null) }} disabled={saving}>
                  Keep it open
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="hd-text-danger" onClick={() => setConfirming(true)}>Cancel request</button>
          )}
        </div>
      )}
    </section>
  )
}
