/**
 * BloodMatcher's waiting-period rule: 90 days after the last recorded donation.
 * This is the app's alert rule, not a clinical eligibility check.
 *
 * All maths uses whole calendar days (UTC day numbers), so time zones and DST
 * never shift a date by one.
 */
export const COOLDOWN_DAYS = 90

const MS_PER_DAY = 86_400_000

export type DonationWindow =
  | { status: 'no-record' }
  | { status: 'unreadable'; raw: string }
  | {
      status: 'waiting'
      lastDay: number
      nextDay: number
      daysRemaining: number
      daysElapsed: number
      /** 0–1 share of the waiting period that has passed */
      progress: number
    }
  | { status: 'open'; lastDay: number; nextDay: number }

/** Parse a YYYY-MM-DD (or ISO string starting with one) into a calendar day number. */
export function parseDateOnly(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const t = Date.UTC(y, mo - 1, d)
  const check = new Date(t)
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null
  return t / MS_PER_DAY
}

/** The user's local calendar day as a day number. */
export function localDayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY
}

export function dayNumberToISO(day: number): string {
  return new Date(day * MS_PER_DAY).toISOString().slice(0, 10)
}

export function formatDay(day: number, style: 'long' | 'short' = 'long'): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(day * MS_PER_DAY))
}

export function getDonationWindow(lastDonationDate: string | null, today: Date = new Date()): DonationWindow {
  if (lastDonationDate == null || lastDonationDate.trim() === '') return { status: 'no-record' }
  const lastDay = parseDateOnly(lastDonationDate)
  if (lastDay == null) return { status: 'unreadable', raw: lastDonationDate }

  const todayNum = localDayNumber(today)
  const nextDay = lastDay + COOLDOWN_DAYS
  if (todayNum < nextDay) {
    const daysElapsed = Math.max(0, todayNum - lastDay)
    return {
      status: 'waiting',
      lastDay,
      nextDay,
      daysRemaining: nextDay - todayNum,
      daysElapsed,
      progress: Math.min(1, daysElapsed / COOLDOWN_DAYS),
    }
  }
  return { status: 'open', lastDay, nextDay }
}
