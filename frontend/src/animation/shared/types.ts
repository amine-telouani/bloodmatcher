export type Role = 'DONOR' | 'HOSPITAL' | 'ADMIN'

export type Urgency = 'NORMAL' | 'URGENT' | 'CRITICAL'

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

/** Preview display model. The real API adapter retains Spring blood-type enum names. */
export interface DonorMe {
  fullName: string
  bloodType: BloodType
  latitude: number | null
  longitude: number | null
  available: boolean
  phone: string | null
  /** Date-only (YYYY-MM-DD) or ISO string; null when no donation has been recorded. */
  lastDonationDate: string | null
}

/** The request fields a RequestCard reads. */
export interface RequestCardData {
  id: string
  hospitalName: string
  bloodType: BloodType
  unitsNeeded: number
  urgency: Urgency
  /** ISO date-time */
  deadline: string
}

export type RequestResponse = 'open' | 'accepted' | 'declined'
