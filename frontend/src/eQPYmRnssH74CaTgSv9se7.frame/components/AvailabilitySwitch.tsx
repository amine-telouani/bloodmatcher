import React, { useState } from 'react'

import { ApiError } from '../../shared/lib/api'
import type { DonorProfile, donorApi } from '../../shared/lib/donorApi'

type Props = {
  available: boolean
  api: typeof donorApi
  onChanged: (p: DonorProfile) => void
  onAuthFailed: (err: unknown) => boolean
}

/** Whether hospitals may alert this donor. Saves on toggle; reports failure inline. */
export function AvailabilitySwitch({ available, api, onChanged, onAuthFailed }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    setSaving(true)
    setError(null)
    try {
      onChanged(await api.setAvailable(!available))
    } catch (err) {
      if (onAuthFailed(err)) return
      setError(err instanceof ApiError ? err.message : 'We couldn’t save that. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dd-avail">
      <button
        type="button"
        role="switch"
        aria-checked={available}
        aria-describedby="dd-avail-hint"
        className="dd-switch"
        onClick={toggle}
        disabled={saving}
        aria-busy={saving}
      >
        <span className="dd-switch-track" aria-hidden="true">
          <span className="dd-switch-thumb" />
        </span>
        <span className="dd-switch-label">{available ? 'Available to donate' : 'Paused'}</span>
      </button>
      <span id="dd-avail-hint" className="bm-hint">
        {saving ? 'Saving…' : available ? 'Hospitals nearby can alert you.' : 'You won’t get new alerts.'}
      </span>
      {error && (
        <p className="bm-error dd-avail-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
