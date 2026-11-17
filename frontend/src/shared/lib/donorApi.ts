import { apiFetch, ApiError, ENDPOINTS } from './api'
import { CAN_RECEIVE_FROM, distanceKm, type BloodType, type RequestStatus, type Urgency } from './blood'
import type { DonorResponse } from './hospitalApi'
import type { Session } from './session'

export type DonorProfile = {
  id: string
  fullName: string
  email: string
  phone: string
  bloodType: BloodType
  city: string
  latitude: number
  longitude: number
  available: boolean
  /** ISO date of the last recorded donation, or null. */
  lastDonationAt: string | null
}

/** A hospital request this donor was matched to, with how they answered. */
export type DonorAlert = {
  requestId: string
  hospitalName: string
  hospitalCity: string
  hospitalPhone: string
  hospitalLatitude: number
  hospitalLongitude: number
  distanceKm: number
  bloodType: BloodType
  units: number
  urgency: Urgency
  status: RequestStatus
  notes: string
  createdAt: string
  response: DonorResponse
}

/** Days a donor waits between whole-blood donations. */
export const DONATION_GAP_DAYS = 56

export function nextEligibleDate(lastDonationAt: string | null): Date | null {
  if (!lastDonationAt) return null
  const next = new Date(new Date(lastDonationAt).getTime() + DONATION_GAP_DAYS * 86400000)
  return next.getTime() > Date.now() ? next : null
}

/* ---------- real API ---------- */

export const donorApi = {
  profile: () => apiFetch<DonorProfile>(ENDPOINTS.donorProfile),
  alerts: () => apiFetch<DonorAlert[]>(ENDPOINTS.donorAlerts),
  setAvailable: (available: boolean) =>
    apiFetch<DonorProfile>(ENDPOINTS.donorAvailability, { method: 'PATCH', body: { available } }),
  respond: (requestId: string, response: Exclude<DonorResponse, 'PENDING'>) =>
    apiFetch<DonorAlert>(ENDPOINTS.requestResponse(requestId), { method: 'POST', body: { response } }),
}

/* ---------- preview stand-in ---------- */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString()

const HOME = { lat: 38.7369, lng: -9.1427 }

const HOSPITALS = {
  stmarys: { name: 'St. Mary’s General', city: 'Lisbon', phone: '+351 213 400 100', lat: 38.7223, lng: -9.1393 },
  santamaria: { name: 'Hospital de Santa Maria', city: 'Lisbon', phone: '+351 217 805 000', lat: 38.7487, lng: -9.1606 },
  almada: { name: 'Hospital Garcia de Orta', city: 'Almada', phone: '+351 212 940 294', lat: 38.6735, lng: -9.1774 },
  cascais: { name: 'Hospital de Cascais', city: 'Cascais', phone: '+351 214 653 000', lat: 38.7186, lng: -9.4166 },
}

type Seed = Omit<DonorAlert, 'hospitalName' | 'hospitalCity' | 'hospitalPhone' | 'hospitalLatitude' | 'hospitalLongitude' | 'distanceKm'> & {
  at: keyof typeof HOSPITALS
}

let store: { profile: DonorProfile; alerts: DonorAlert[] } | null = null

function toAlert({ at, ...s }: Seed): DonorAlert {
  const h = HOSPITALS[at]
  return {
    ...s,
    hospitalName: h.name,
    hospitalCity: h.city,
    hospitalPhone: h.phone,
    hospitalLatitude: h.lat,
    hospitalLongitude: h.lng,
    distanceKm: Math.round(distanceKm(HOME.lat, HOME.lng, h.lat, h.lng) * 10) / 10,
  }
}

function mockStore(session: Session | null) {
  if (!store) {
    const bloodType: BloodType = 'O_NEGATIVE'
    const seeds: Seed[] = [
      { at: 'stmarys', requestId: 'r1', bloodType: 'O_NEGATIVE', units: 4, urgency: 'CRITICAL', status: 'OPEN', notes: 'Trauma bay 2 — multiple casualties from the A2 collision.', createdAt: minsAgo(18), response: 'PENDING' },
      { at: 'santamaria', requestId: 'r5', bloodType: 'A_NEGATIVE', units: 2, urgency: 'HIGH', status: 'OPEN', notes: 'Neonatal unit. Please come to the blood bank entrance on Av. Prof. Egas Moniz.', createdAt: minsAgo(75), response: 'PENDING' },
      { at: 'almada', requestId: 'r6', bloodType: 'B_POSITIVE', units: 3, urgency: 'NORMAL', status: 'OPEN', notes: '', createdAt: minsAgo(60 * 5), response: 'PENDING' },
      { at: 'stmarys', requestId: 'r2', bloodType: 'O_POSITIVE', units: 2, urgency: 'HIGH', status: 'OPEN', notes: 'Scheduled surgery tomorrow 08:00.', createdAt: minsAgo(190), response: 'DECLINED' },
      { at: 'cascais', requestId: 'r7', bloodType: 'O_NEGATIVE', units: 1, urgency: 'CRITICAL', status: 'FULFILLED', notes: 'Post-partum haemorrhage.', createdAt: minsAgo(60 * 24 * 9), response: 'ACCEPTED' },
    ]
    store = {
      profile: {
        id: 'd1',
        fullName: session?.user?.name || 'Ana Ribeiro',
        email: session?.user?.email || 'ana.ribeiro@mail.pt',
        phone: '+351 912 345 678',
        bloodType,
        city: 'Lisbon',
        latitude: HOME.lat,
        longitude: HOME.lng,
        available: true,
        lastDonationAt: minsAgo(60 * 24 * 74),
      },
      alerts: seeds.filter((s) => CAN_RECEIVE_FROM[s.bloodType].includes(bloodType)).map(toAlert),
    }
  }
  return store
}

export function mockDonorApi(session: Session | null): typeof donorApi {
  return {
    async profile() {
      await wait(500)
      return { ...mockStore(session).profile }
    },
    async alerts() {
      await wait(700)
      return mockStore(session).alerts.map((a) => ({ ...a }))
    },
    async setAvailable(available) {
      await wait(500)
      const s = mockStore(session)
      s.profile = { ...s.profile, available }
      return { ...s.profile }
    },
    async respond(requestId, response) {
      await wait(800)
      const s = mockStore(session)
      const alert = s.alerts.find((a) => a.requestId === requestId)
      if (!alert) throw new ApiError(404, 'This request no longer exists.')
      if (alert.status !== 'OPEN') throw new ApiError(409, 'The hospital has already closed this request.')
      const updated = { ...alert, response }
      s.alerts = s.alerts.map((a) => (a.requestId === requestId ? updated : a))
      return { ...updated }
    },
  }
}
