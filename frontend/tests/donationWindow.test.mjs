import assert from 'node:assert/strict'
import test from 'node:test'
import { getDonationWindow, parseDateOnly, dayNumberToISO } from '../src/animation/shared/lib/donationWindow.ts'

test('missing dates have no invented history', () => {
  assert.equal(getDonationWindow(null).status, 'no-record')
  assert.equal(getDonationWindow('  ').status, 'no-record')
})

test('invalid dates do not display a donation window', () => {
  assert.equal(getDonationWindow('not-a-date').status, 'unreadable')
  assert.equal(getDonationWindow('2026-02-30').status, 'unreadable')
})

test('a donation starts a full ninety-day waiting period', () => {
  const window = getDonationWindow('2026-01-01', new Date(2026, 0, 1, 23, 59))
  assert.equal(window.status, 'waiting')
  assert.equal(window.daysElapsed, 0)
  assert.equal(window.daysRemaining, 90)
  assert.equal(window.progress, 0)
})

test('the last waiting day remains closed through the local evening', () => {
  const window = getDonationWindow('2026-01-01', new Date(2026, 2, 31, 23, 59))
  assert.equal(window.status, 'waiting')
  assert.equal(window.daysElapsed, 89)
  assert.equal(window.daysRemaining, 1)
  assert.equal(dayNumberToISO(window.nextDay), '2026-04-01')
})

test('the window opens at the start of calendar day ninety', () => {
  const window = getDonationWindow('2026-01-01', new Date(2026, 3, 1))
  assert.equal(window.status, 'open')
  assert.equal(dayNumberToISO(window.nextDay), '2026-04-01')
})

test('a long elapsed period stays open', () => {
  assert.equal(getDonationWindow('2025-01-01', new Date(2026, 10, 23)).status, 'open')
})

test('leap-day donations cross the month boundaries correctly', () => {
  const window = getDonationWindow('2024-02-29', new Date(2024, 4, 28))
  assert.equal(window.status, 'waiting')
  assert.equal(window.daysRemaining, 1)
  assert.equal(dayNumberToISO(window.nextDay), '2024-05-29')
})

test('ISO fixture timestamps preserve their recorded date component', () => {
  assert.equal(parseDateOnly('2026-11-23T00:00:00Z'), parseDateOnly('2026-11-23'))
})

test('an out-of-range leap day is rejected', () => {
  assert.equal(parseDateOnly('2025-02-29'), null)
})
