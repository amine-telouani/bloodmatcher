import { apiFetch, ApiError, ENDPOINTS } from './api'
import { CAN_RECEIVE_FROM, distanceKm, type BloodType, type RequestStatus, type Urgency } from './blood'
import type { Session } from './session'

export type HospitalProfile = {
  id: string
  name: string
  city: string
  email: string
  latitude: number
  longitude: number
}

export type BloodRequest = {
  id: string
  bloodType: BloodType
  units: number
  urgency: Urgency
  status: RequestStatus
  notes: string
  createdAt: string
  matchedCount: number
  acceptedCount: number
}

export type DonorResponse = 'PENDING' | 'ACCEPTED' | 'DECLINED'

export type DonorMatch = {
  donorId: string
  fullName: string
  bloodType: BloodType
  phone: string
  distanceKm: number
  response: DonorResponse
}

export type NewRequest = { bloodType: BloodType; units: number; urgency: Urgency; notes: string }

/* ---------- real API ---------- */

export const hospitalApi = {
  profile: () => apiFetch<HospitalProfile>(ENDPOINTS.hospitalProfile),
  requests: () => apiFetch<BloodRequest[]>(ENDPOINTS.hospitalRequests),
  create: (r: NewRequest) => apiFetch<BloodRequest>(ENDPOINTS.hospitalRequests, { method: 'POST', body: r }),
  matches: (id: string) => apiFetch<DonorMatch[]>(ENDPOINTS.requestMatches(id)),
  setStatus: (id: string, status: RequestStatus) =>
    apiFetch<BloodRequest>(ENDPOINTS.requestStatus(id), { method: 'PATCH', body: { status } }),
}

/* ---------- preview stand-in ---------- */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString()

const DONORS: { id: string; fullName: string; bloodType: BloodType; phone: string; lat: number; lng: number }[] = [
  { id: 'd1', fullName: 'Ana Ribeiro', bloodType: 'O_NEGATIVE', phone: '+351 912 345 678', lat: 38.7369, lng: -9.1427 },
  { id: 'd2', fullName: 'Tomás Ferreira', bloodType: 'O_POSITIVE', phone: '+351 913 220 104', lat: 38.7101, lng: -9.1366 },
  { id: 'd3', fullName: 'Inês Carvalho', bloodType: 'A_POSITIVE', phone: '+351 917 448 931', lat: 38.7535, lng: -9.1887 },
  { id: 'd4', fullName: 'Rui Almeida', bloodType: 'A_NEGATIVE', phone: '+351 926 013 552', lat: 38.6979, lng: -9.4215 },
  { id: 'd5', fullName: 'Marta Sousa', bloodType: 'B_POSITIVE', phone: '+351 914 760 228', lat: 38.7614, lng: -9.0953 },
  { id: 'd6', fullName: 'João Pereira', bloodType: 'O_NEGATIVE', phone: '+351 936 551 870', lat: 38.6446, lng: -9.1012 },
  { id: 'd7', fullName: 'Beatriz Lopes', bloodType: 'AB_POSITIVE', phone: '+351 918 302 645', lat: 38.7223, lng: -9.1500 },
  { id: 'd8', fullName: 'Pedro Santos', bloodType: 'B_NEGATIVE', phone: '+351 965 117 093', lat: 38.7802, lng: -9.1201 },
  { id: 'd9', fullName: 'Sofia Martins', bloodType: 'A_POSITIVE', phone: '+351 912 884 016', lat: 38.7167, lng: -9.1333 },
  { id: 'd10', fullName: 'Diogo Costa', bloodType: 'O_POSITIVE', phone: '+351 927 640 381', lat: 38.7412, lng: -9.1580 },
]

/** How each donor has answered each request; anything missing is PENDING. */
const responses: Record<string, Record<string, DonorResponse>> = {
  r1: { d1: 'ACCEPTED', d6: 'PENDING' },
  r2: { d2: 'ACCEPTED', d1: 'DECLINED', d10: 'ACCEPTED' },
  r3: { d3: 'ACCEPTED', d9: 'ACCEPTED' },
}

let store: { profile: HospitalProfile; requests: BloodRequest[] } | null = null

function mockStore(session: Session | null) {
  if (!store) {
    store = {
      profile: {
        id: 'h1',
        name: session?.user?.name || 'St. Mary’s General',
        city: 'Lisbon',
        email: session?.user?.email || 'bloodbank@stmarys.org',
        latitude: 38.7223,
        longitude: -9.1393,
      },
      requests: [
        { id: 'r1', bloodType: 'O_NEGATIVE', units: 4, urgency: 'CRITICAL', status: 'OPEN', notes: 'Trauma bay 2 — multiple casualties from the A2 collision.', createdAt: minsAgo(18), matchedCount: 0, acceptedCount: 0 },
        { id: 'r2', bloodType: 'O_POSITIVE', units: 2, urgency: 'HIGH', status: 'OPEN', notes: 'Scheduled surgery tomorrow 08:00.', createdAt: minsAgo(190), matchedCount: 0, acceptedCount: 0 },
        { id: 'r3', bloodType: 'A_POSITIVE', units: 3, urgency: 'NORMAL', status: 'FULFILLED', notes: '', createdAt: minsAgo(60 * 26), matchedCount: 0, acceptedCount: 0 },
        { id: 'r4', bloodType: 'B_NEGATIVE', units: 1, urgency: 'HIGH', status: 'CANCELLED', notes: 'Patient transferred to Santa Maria.', createdAt: minsAgo(60 * 72), matchedCount: 0, acceptedCount: 0 },
      ],
    }
    store.requests = store.requests.map(withCounts)
  }
  return store
}

function matchesFor(req: BloodRequest): DonorMatch[] {
  const p = store!.profile
  const ok = CAN_RECEIVE_FROM[req.bloodType]
  return DONORS.filter((d) => ok.includes(d.bloodType))
    .map((d) => ({
      donorId: d.id,
      fullName: d.fullName,
      bloodType: d.bloodType,
      phone: d.phone,
      distanceKm: Math.round(distanceKm(p.latitude, p.longitude, d.lat, d.lng) * 10) / 10,
      response: responses[req.id]?.[d.id] ?? ('PENDING' as DonorResponse),
    }))
    .filter((m) => m.distanceKm <= 25)
    .sort((a, b) => rank(a.response) - rank(b.response) || a.distanceKm - b.distanceKm)
}

const rank = (r: DonorResponse) => (r === 'ACCEPTED' ? 0 : r === 'PENDING' ? 1 : 2)

function withCounts(r: BloodRequest): BloodRequest {
  const m = matchesFor(r)
  return { ...r, matchedCount: m.length, acceptedCount: m.filter((x) => x.response === 'ACCEPTED').length }
}

export function mockHospitalApi(session: Session | null): typeof hospitalApi {
  return {
    async profile() {
      await wait(500)
      return { ...mockStore(session).profile }
    },
    async requests() {
      await wait(700)
      return mockStore(session).requests.map(withCounts)
    },
    async create(r) {
      await wait(900)
      const s = mockStore(session)
      if (r.notes.toLowerCase().includes('fail')) throw new ApiError(500, 'We couldn’t post this request. Please try again.')
      const req = withCounts({
        id: 'r' + Math.random().toString(36).slice(2, 8),
        ...r,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        matchedCount: 0,
        acceptedCount: 0,
      })
      s.requests = [req, ...s.requests]
      return req
    },
    async matches(id) {
      await wait(600)
      const req = mockStore(session).requests.find((r) => r.id === id)
      if (!req) throw new ApiError(404, 'This request no longer exists.')
      return matchesFor(req)
    },
    async setStatus(id, status) {
      await wait(700)
      const s = mockStore(session)
      s.requests = s.requests.map((r) => (r.id === id ? { ...r, status } : r))
      return withCounts(s.requests.find((r) => r.id === id)!)
    },
  }
}
