import React from 'react'
import { format } from 'date-fns'
import { Check, Clock } from 'lucide-react'

import { UrgencyBloodBag } from './UrgencyBloodBag'
import { buttonClass } from './buttonStyles'
import type { RequestCardData, RequestResponse } from '../types'

type Props = {
  request: RequestCardData
  response?: RequestResponse
  selected?: boolean
  onSelect?: () => void
  onAccept?: () => void
  onDecline?: () => void
  busy?: boolean
}

/** A donor-facing request alert. Accepting is an intent to donate, never a completed donation. */
export function RequestCard({ request, response = 'open', selected = false, onSelect, onAccept, onDecline, busy }: Props) {
  const titleId = `req-${request.id}`
  const units = `${request.unitsNeeded} unit${request.unitsNeeded === 1 ? '' : 's'}`

  return (
    <article
      aria-labelledby={titleId}
      onClick={onSelect}
      className={`grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-3xl bg-paper p-4 transition-shadow duration-200 sm:gap-5 sm:p-5 ${RING[request.urgency]} ${
        selected ? 'shadow-[0_0_0_3px_rgba(38,34,34,0.85)]' : ''
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <UrgencyBloodBag urgency={request.urgency} emphasize={selected} />

      <div className="flex min-w-0 flex-col">
        <p className="truncate text-sm text-muted">{request.hospitalName}</p>
        <h3 id={titleId} className="mt-0.5 font-display text-xl font-semibold leading-snug">
          {onSelect ? (
            <button
              type="button"
              aria-pressed={selected}
              onClick={(e) => (e.stopPropagation(), onSelect())}
              className="rounded-md text-left"
            >
              {request.bloodType} needed · {units}
            </button>
          ) : (
            <>
              {request.bloodType} needed · {units}
            </>
          )}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
          <Clock className="h-4 w-4 shrink-0" aria-hidden />
          Needed by {format(new Date(request.deadline), 'EEE d MMM, HH:mm')}
        </p>

        <div className={`${onAccept || response !== 'open' ? 'mt-4' : 'hidden'} flex min-h-9 flex-wrap items-center gap-2`} onClick={(e) => e.stopPropagation()}>
          {response === 'open' && onAccept && onDecline && (
            <>
              <button type="button" onClick={onAccept} disabled={busy} className={buttonClass('primary', 'sm')}>
                {busy ? 'Accepting…' : 'Accept request'}
              </button>
              <button type="button" onClick={onDecline} disabled={busy} className={buttonClass('secondary', 'sm')}>
                Decline
              </button>
            </>
          )}
          {response === 'accepted' && (
            <p className="flex items-start gap-2 text-sm text-ink">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-red-dark" aria-hidden />
              <span>
                <strong className="font-semibold">Accepted.</strong> The hospital records the donation once it's done.
              </span>
            </p>
          )}
          {response === 'declined' && <p className="text-sm text-ink-soft">You declined this request.</p>}
        </div>
      </div>
    </article>
  )
}

const RING = {
  NORMAL: 'ring-1 ring-ink/10',
  URGENT: 'ring-1 ring-red-dark/40',
  CRITICAL: 'ring-2 ring-red-deep/70',
} as const
