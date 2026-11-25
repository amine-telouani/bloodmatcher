/**
 * PREVIEW-ONLY examples for the interface preview and dashboard preview.
 * Never merge these with API responses or show them as live requests.
 */
import type { DonorMe, RequestCardData } from '../types'
import { dayNumberToISO, localDayNumber } from '../lib/donationWindow'

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString()
const daysAgo = (d: number) => dayNumberToISO(localDayNumber(new Date()) - d)

export const SAMPLE_REQUESTS: RequestCardData[] = [
  {
    id: 'sample-critical',
    hospitalName: 'Riverside General · sample',
    bloodType: 'O-',
    unitsNeeded: 3,
    urgency: 'CRITICAL',
    deadline: hoursFromNow(6),
  },
  {
    id: 'sample-urgent',
    hospitalName: 'Northgate Clinic · sample',
    bloodType: 'A+',
    unitsNeeded: 2,
    urgency: 'URGENT',
    deadline: hoursFromNow(30),
  },
  {
    id: 'sample-normal',
    hospitalName: "St Brigid's Hospital · sample",
    bloodType: 'O+',
    unitsNeeded: 1,
    urgency: 'NORMAL',
    deadline: hoursFromNow(24 * 4),
  },
]

const base: Omit<DonorMe, 'lastDonationDate' | 'available'> = {
  fullName: 'Sample Donor',
  bloodType: 'O-',
  latitude: 51.5,
  longitude: -0.12,
  phone: null,
}

export const SAMPLE_DONORS = {
  waiting: { ...base, lastDonationDate: daysAgo(61), available: true },
  open: { ...base, lastDonationDate: daysAgo(104), available: true },
  'no-record': { ...base, lastDonationDate: null, available: true },
  unavailable: { ...base, lastDonationDate: daysAgo(30), available: false },
} satisfies Record<string, DonorMe>

export type SampleDonorScenario = keyof typeof SAMPLE_DONORS
