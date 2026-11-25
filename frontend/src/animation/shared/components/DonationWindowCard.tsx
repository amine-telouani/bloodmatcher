import React, { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CalendarDays, CirclePause, CircleCheck } from 'lucide-react'

import { COOLDOWN_DAYS, formatDay, getDonationWindow } from '../lib/donationWindow'
import { EASE_OUT } from '../tokens'
import type { DonorMe } from '../types'

type Props = Pick<DonorMe, 'lastDonationDate' | 'available'> & {
  /** Injected for tests/previews; defaults to now. */
  today?: Date
  className?: string
}

/**
 * "Next donation window" — built only from lastDonationDate and available (GET /api/donors/me).
 * Availability and the waiting period are separate: one is the donor's choice, the other the app's 90-day rule.
 */
export function DonationWindowCard({ lastDonationDate, available, today, className = '' }: Props) {
  const reduced = useReducedMotion()
  const w = getDonationWindow(lastDonationDate, today)
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className={`flex flex-col rounded-[28px] bg-paper p-5 ring-1 ring-ink/10 sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h3 id={titleId} className="flex items-center gap-2 font-display text-lg font-semibold">
          <CalendarDays className="h-5 w-5 text-red-dark" aria-hidden />
          Next donation window
        </h3>
        <AvailabilityBadge available={available} />
      </div>

      {w.status === 'waiting' && (
        <div className="mt-5">
          <p className="text-sm text-muted">Opens on</p>
          <p className="font-display text-3xl font-semibold leading-tight">{formatDay(w.nextDay)}</p>
          <p className="mt-1 text-[15px] text-ink">
            {w.daysRemaining === 1 ? 'Tomorrow — 1 day to go.' : `In ${w.daysRemaining} days.`} Thanks for your last
            donation.
          </p>
          <div
            className="mt-5 h-2.5 overflow-hidden rounded-full bg-blush"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={COOLDOWN_DAYS}
            aria-valuenow={w.daysElapsed}
            aria-valuetext={`Day ${w.daysElapsed} of the ${COOLDOWN_DAYS}-day waiting period`}
          >
            <motion.div
              className="h-full rounded-full bg-red-dark"
              initial={reduced ? false : { width: '0%' }}
              whileInView={{ width: `${w.progress * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
              style={reduced ? { width: `${w.progress * 100}%` } : undefined}
            />
          </div>
          <div className="mt-2 flex justify-between gap-3 text-sm text-muted">
            <span>Last donation {formatDay(w.lastDay, 'short')}</span>
            <span className="shrink-0">
              Day {w.daysElapsed} of {COOLDOWN_DAYS}
            </span>
          </div>
        </div>
      )}

      {w.status === 'open' && (
        <div className="mt-5">
          <p className="flex items-center gap-2 font-display text-3xl font-semibold leading-tight">
            <CircleCheck className="h-7 w-7 shrink-0 text-red-dark" aria-hidden />
            Open now
          </p>
          <p className="mt-1 text-[15px] text-ink">
            Your waiting period ended on {formatDay(w.nextDay)}.
            {available ? ' You can receive alerts for compatible requests nearby.' : ''}
          </p>
          <p className="mt-3 text-sm text-muted">Last donation {formatDay(w.lastDay, 'short')}</p>
        </div>
      )}

      {w.status === 'no-record' && (
        <div className="mt-5">
          <p className="font-display text-2xl font-semibold leading-tight">No donation recorded yet</p>
          <p className="mt-1 text-[15px] leading-relaxed text-ink">
            When a hospital confirms a donation, its date appears here and the {COOLDOWN_DAYS}-day waiting period starts.
          </p>
        </div>
      )}

      {w.status === 'unreadable' && (
        <div className="mt-5">
          <p className="font-display text-2xl font-semibold leading-tight">We couldn't read your last donation date</p>
          <p className="mt-1 text-[15px] leading-relaxed text-ink">
            Your profile has a date we don't recognise, so we're not showing a window. Contact the hospital that recorded it.
          </p>
        </div>
      )}

      {!available && (
        <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-cream p-3 text-sm leading-relaxed text-ink ring-1 ring-ink/10">
          <CirclePause className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">Alerts are paused</strong> because you've set yourself as unavailable. This is
            separate from the waiting period — switch it back on in your profile when you're ready.
          </span>
        </p>
      )}

      <p className="mt-auto pt-5 text-xs leading-relaxed text-muted">
        Based on BloodMatcher's {COOLDOWN_DAYS}-day waiting period, not a medical check. Staff confirm eligibility when you
        donate.
      </p>
    </section>
  )
}

function AvailabilityBadge({ available }: { available: boolean }) {
  return available ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blush px-2.5 py-1 text-xs font-semibold text-ink">
      <span className="h-1.5 w-1.5 rounded-full bg-red-dark" aria-hidden />
      Available
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink ring-1 ring-ink/20">
      <CirclePause className="h-3.5 w-3.5" aria-hidden />
      Unavailable
    </span>
  )
}
