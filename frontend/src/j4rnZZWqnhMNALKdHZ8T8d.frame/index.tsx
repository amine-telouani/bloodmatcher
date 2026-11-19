
import { NavProvider } from '../shared/bloodmatcher/nav'
import { useEffect, useState } from 'react'

import { BmNav } from '../shared/bloodmatcher/components/BmNav'


/* ---------- mock data (design mode — no backend calls) ---------- */

type QueueState = 'waiting' | 'verifying' | 'verified'

type PendingHospital = {
  id: string
  name: string
  city: string
  email: string
  waitingDays: number
}

const PENDING_HOSPITALS: PendingHospital[] = [
  { id: 'h-31', name: 'Hospital da Luz Lisboa', city: 'Lisbon', email: 'bloodbank@luzlisboa.pt', waitingDays: 2 },
  { id: 'h-32', name: 'Klinikum rechts der Isar', city: 'Munich', email: 'blutbank@mri.tum.de', waitingDays: 1 },
  { id: 'h-33', name: 'Centre Hospitalier de Lyon', city: 'Lyon', email: 'banque.sang@chude-lyon.fr', waitingDays: 5 },
  { id: 'h-34', name: 'Ospedale San Raffaele', city: 'Milan', email: 'trasfusioni@hsr.it', waitingDays: 3 },
]

const STATS = [
  { num: '1,284', label: 'Donors' },
  { num: '37', label: 'Hospitals' },
  { num: '9', label: 'Open requests' },
  { num: '312', label: 'Fulfilled requests' },
] as const

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/* ---------- component ---------- */

function AdminPagePage() {
  const [queue, setQueue] = useState<Record<string, QueueState>>(() =>
    Object.fromEntries(PENDING_HOSPITALS.map((h) => [h.id, 'waiting' as QueueState])),
  )
  const [flash, setFlash] = useState<string | null>(null)

  const waitingCount = PENDING_HOSPITALS.filter((h) => queue[h.id] !== 'verified').length

  // clear the confirmation flash after a moment
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 4000)
    return () => clearTimeout(t)
  }, [flash])

  async function verify(h: PendingHospital) {
    setQueue((q) => ({ ...q, [h.id]: 'verifying' }))
    await wait(900)
    setQueue((q) => ({ ...q, [h.id]: 'verified' }))
    setFlash(`${h.name} can now post requests and receive donor alerts.`)
  }

  return (
    <div className="bm-page">
      <div className="bm-panel">
        <BmNav active="/admin" />

        <main className="hd-main">
          <div className="hd-head">
            <div className="hd-who">
              <h1 className="hd-name">Admin</h1>
              <p className="hd-meta">Hospital verification &amp; platform stats</p>
            </div>
            <span className="ad-who">
              <span className="ad-who-dot" aria-hidden="true" />
              Signed in as admin@bloodmatcher.pt
            </span>
          </div>

          {/* platform stats */}
          <section aria-labelledby="ad-stats-heading">
            <h2 id="ad-stats-heading" className="bm-legend">Platform today</h2>
            <div className="ad-stats">
              {STATS.map((s) => (
                <div key={s.label} className="ad-stat">
                  <span className="ad-stat-num">{s.num}</span>
                  <span className="ad-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* verification queue */}
          <section aria-labelledby="ad-queue-heading">
            <div className="hd-list-head">
              <h2 id="ad-queue-heading" className="hd-section-title">
                Waiting for verification
              </h2>
              {waitingCount > 0 && <span className="hd-count">{waitingCount}</span>}
            </div>

            {flash && (
              <p className="hd-flash" role="status">
                {flash}
              </p>
            )}

            {waitingCount === 0 ? (
              <div className="hd-empty">
                <span className="hd-empty-title">All caught up</span>
                <p>No hospitals are waiting for verification. New registrations will appear here.</p>
              </div>
            ) : (
              <ul className="hd-list">
                {PENDING_HOSPITALS.map((h) => {
                  const state = queue[h.id] ?? 'waiting'
                  if (state === 'verified') return null
                  return (
                    <li key={h.id} className="ad-row">
                      <span className="hd-type" aria-hidden="true">{h.name.charAt(0)}</span>
                      <div className="ad-row-body">
                        <span className="ad-row-name">{h.name}</span>
                        <span className="ad-row-meta">
                          {h.city} · {h.email} · waiting {h.waitingDays} {h.waitingDays === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      <div className="ad-row-side">
                        {state === 'verifying' ? (
                          <button type="button" className="bm-button ad-verify" disabled aria-busy="true">
                            <span className="bm-spinner" aria-hidden="true" /> Verifying…
                          </button>
                        ) : (
                          <button type="button" className="bm-button ad-verify" onClick={() => verify(h)}>
                            Verify
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
                {PENDING_HOSPITALS.some((h) => queue[h.id] === 'verified') && (
                  <li className="ad-row">
                    <span className="hd-type is-muted" aria-hidden="true">✓</span>
                    <div className="ad-row-body">
                      <span className="ad-row-name">
                        {PENDING_HOSPITALS.filter((h) => queue[h.id] === 'verified').map((h) => h.name).join(', ')}
                      </span>
                      <span className="ad-row-meta">
                        <span className="hd-status hd-status--fulfilled ad-verified">Verified just now</span>
                      </span>
                    </div>
                  </li>
                )}
              </ul>
            )}
            {waitingCount === 0 && (
              <p className="ad-done-note">Verified hospitals appear in the hospitals list immediately.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}


/* ---------- frame ---------- */

type Props = Partial<typeof args> & { onNavigate?: (path: string) => void }

export default function AdminPage(props: Props) {
  const { onNavigate, ...rest } = { ...args, ...props }
  return (
    <NavProvider onNavigate={onNavigate} params={rest as Record<string, string>}>
      <AdminPagePage />
    </NavProvider>
  )
}

export const args = {}

export const argTypes = {}
