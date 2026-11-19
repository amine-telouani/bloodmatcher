import { NavProvider } from '../shared/bloodmatcher/nav'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from '../shared/bloodmatcher/nav'

import { BmNav } from '../shared/bloodmatcher/components/BmNav'
import { apiFetch, ApiError, ENDPOINTS } from '../shared/bloodmatcher/lib/api'
import { clearSession, readSession } from '../shared/bloodmatcher/lib/session'


type Stats = {
  totalDonors: number
  totalHospitals: number
  verifiedHospitals: number
  totalRequests: number
  openRequests: number
  fulfilledRequests: number
  totalDonations: number
}

type Verified = { id: number; name: string; city: string; verified: boolean }

/* ---------- component ---------- */

function AdminPagePage() {
  const navigate = useNavigate()
  const session = readSession()
  const isAdmin = !!session && session.role === 'admin'

  const [stats, setStats] = useState<Stats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)

  const [hospitalId, setHospitalId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verified, setVerified] = useState<Verified[]>([])
  const [flash, setFlash] = useState<string | null>(null)

  // not signed in as admin: back to sign in
  useEffect(() => {
    if (!isAdmin) navigate('/login')
  }, [isAdmin, navigate])

  async function loadStats() {
    setStatsError(null)
    try {
      setStats(await apiFetch<Stats>(ENDPOINTS.adminStats))
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login')
        return
      }
      setStatsError(err instanceof ApiError ? err.message : 'We couldn’t load the stats.')
    }
  }

  useEffect(() => {
    if (isAdmin) loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  // clear the confirmation flash after a moment
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 4000)
    return () => clearTimeout(t)
  }, [flash])

  // MOCK: no backend endpoint for the list of hospitals waiting for verification,
  // so the admin verifies a hospital by its ID.
  async function verify(e: FormEvent) {
    e.preventDefault()
    if (verifying) return
    const id = hospitalId.trim()
    if (!/^\d+$/.test(id)) {
      setVerifyError('Enter the hospital’s numeric ID.')
      return
    }
    setVerifying(true)
    setVerifyError(null)
    try {
      const h = await apiFetch<Verified>(ENDPOINTS.adminVerify(id), { method: 'PUT' })
      setVerified((prev) => [h, ...prev.filter((x) => x.id !== h.id)])
      setFlash(`${h.name} can now post requests and receive donor alerts.`)
      setHospitalId('')
      loadStats()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login')
        return
      }
      setVerifyError(err instanceof ApiError ? err.message : 'We couldn’t verify this hospital. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  function signOut() {
    clearSession()
    navigate('/login')
  }

  const tiles = [
    { num: stats?.totalDonors, label: 'Donors' },
    { num: stats?.totalHospitals, label: 'Hospitals' },
    { num: stats?.openRequests, label: 'Open requests' },
    { num: stats?.fulfilledRequests, label: 'Fulfilled requests' },
  ]

  if (!isAdmin) return null

  return (
      <div className="bm-page">
        <div className="bm-panel">
          <BmNav active="/admin" onNavigate={navigate} session={session} onSignOut={signOut} />

          <main className="hd-main">
            <div className="hd-head">
              <div className="hd-who">
                <h1 className="hd-name">Admin</h1>
                <p className="hd-meta">Hospital verification &amp; platform stats</p>
              </div>
              <span className="ad-who">
              <span className="ad-who-dot" aria-hidden="true" />
              Signed in as {session?.email}
            </span>
            </div>

            {/* platform stats */}
            <section aria-labelledby="ad-stats-heading">
              <h2 id="ad-stats-heading" className="bm-legend">Platform today</h2>
              {statsError ? (
                  <div className="hd-problem" role="alert">
                    <p className="hd-problem-title">We couldn’t load the stats.</p>
                    <p>{statsError}</p>
                    <button type="button" className="bm-ghost" onClick={loadStats}>
                      Try again
                    </button>
                  </div>
              ) : (
                  <div className="ad-stats">
                    {tiles.map((s) => (
                        <div key={s.label} className="ad-stat">
                          <span className="ad-stat-num">{s.num ?? '–'}</span>
                          <span className="ad-stat-label">{s.label}</span>
                        </div>
                    ))}
                  </div>
              )}
            </section>

            {/* verification */}
            <section aria-labelledby="ad-queue-heading">
              <div className="hd-list-head">
                <h2 id="ad-queue-heading" className="hd-section-title">
                  Verify a hospital
                </h2>
              </div>

              {flash && (
                  <p className="hd-flash" role="status">
                    {flash}
                  </p>
              )}

              <form className="bm-form" onSubmit={verify} noValidate>
                <div className="bm-field">
                  <label htmlFor="ad-hospital-id">Hospital ID</label>
                  <input
                      id="ad-hospital-id"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 27"
                      value={hospitalId}
                      onChange={(e) => {
                        setHospitalId(e.target.value)
                        if (verifyError) setVerifyError(null)
                      }}
                      aria-invalid={!!verifyError}
                      disabled={verifying}
                  />
                  {verifyError && <p className="bm-field-error">{verifyError}</p>}
                </div>
                <button type="submit" className="bm-button ad-verify" disabled={verifying} aria-busy={verifying}>
                  {verifying ? (
                      <>
                        <span className="bm-spinner" aria-hidden="true" /> Verifying…
                      </>
                  ) : (
                      'Verify hospital'
                  )}
                </button>
              </form>

              {verified.length > 0 && (
                  <ul className="hd-list">
                    {verified.map((h) => (
                        <li key={h.id} className="ad-row">
                          <span className="hd-type is-muted" aria-hidden="true">✓</span>
                          <div className="ad-row-body">
                            <span className="ad-row-name">{h.name}</span>
                            <span className="ad-row-meta">
                        {h.city} · ID {h.id} · <span className="hd-status hd-status--fulfilled ad-verified">Verified just now</span>
                      </span>
                          </div>
                        </li>
                    ))}
                  </ul>
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