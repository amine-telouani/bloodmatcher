import { NavProvider } from '../shared/bloodmatcher/nav'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from '../shared/bloodmatcher/nav'

import { AlertDetail } from '../shared/bloodmatcher/components/donor/AlertDetail'
import { BmNav } from '../shared/bloodmatcher/components/BmNav'
import { donorApi, type DonorAlert } from '../shared/bloodmatcher/lib/donorApi'


type Variant = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'DONATED'

const VARIANTS: { id: Variant; label: string }[] = [
  { id: 'PENDING', label: 'New alert' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'DECLINED', label: 'Declined' },
  { id: 'DONATED', label: 'Donated' },
]

/* ---------- component ---------- */

function DonorAlertPagePage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [alert, setAlert] = useState<DonorAlert | null>(null)
  const [variant, setVariant] = useState<Variant>('PENDING')

  const alertRef = useRef<DonorAlert | null>(alert)
  alertRef.current = alert

  // Load the real alerts: the requested one, or the first open one.
  useEffect(() => {
    let cancelled = false
    donorApi
        .alerts()
        .then((list) => {
          if (cancelled) return
          const seed = list.find((a) => a.requestId === id) ?? list.find((a) => a.status === 'OPEN') ?? list[0]
          if (seed && !alertRef.current) {
            const copy = { ...seed }
            alertRef.current = copy
            setAlert(copy)
            setVariant(copy.response)
          }
        })
        .catch(() => {})
    return () => { cancelled = true }
  }, [id])

  const api = donorApi

  function resetTo(v: Variant) {
    setVariant(v)
    if (alertRef.current) {
      const next = { ...alertRef.current, response: v }
      alertRef.current = next
      setAlert(next)
    }
  }

  if (!alert) {
    return (
        <div className="bm-page">
          <div className="bm-panel">
            <BmNav active="/donor" onNavigate={navigate} onSignOut={() => navigate('/login')} />
            <main className="hd-main da-main">
              <p className="hd-empty">
                <span className="hd-empty-title">No alert found</span>
                <p>This alert is no longer in your list.</p>
                <Link to="/donor" className="bm-ghost">Back to your dashboard</Link>
              </p>
            </main>
          </div>
        </div>
    )
  }

  return (
      <div className="bm-page">
        <div className="bm-panel">
          <BmNav active="/donor" onNavigate={navigate} onSignOut={() => navigate('/login')} />

          <main className="hd-main da-main">
            <div className="hd-head">
              <div className="hd-who">
                <Link to="/donor" className="hd-back">← Back to alerts</Link>
                <h1 className="hd-name">Alert</h1>
              </div>
            </div>

            {/* design-preview switcher between the alert's answer states */}
            <div className="da-tabs-row">
              <p className="da-tabs-label">Outcome preview</p>
              <div className="hd-tabs" role="tablist" aria-label="Outcome preview">
                {VARIANTS.map((v) => (
                    <button
                        key={v.id}
                        type="button"
                        role="tab"
                        aria-selected={variant === v.id}
                        className={`hd-tab ${variant === v.id ? 'is-active' : ''}`}
                        onClick={() => resetTo(v.id)}
                    >
                      {v.label}
                    </button>
                ))}
              </div>
            </div>

            <div className="da-card">
              <AlertDetail
                  alert={alert}
                  api={api}
                  eligibleFrom={null}
                  flash={null}
                  onResponded={(updated) => {
                    alertRef.current = updated
                    setAlert(updated)
                    setVariant(updated.response)
                  }}
                  onAuthFailed={() => false}
              />
            </div>
          </main>
        </div>
      </div>
  )
}


/* ---------- frame ---------- */

type Props = Partial<typeof args> & { onNavigate?: (path: string) => void }

export default function DonorAlertPage(props: Props) {
  const { onNavigate, ...rest } = { ...args, ...props }
  return (
      <NavProvider onNavigate={onNavigate} params={rest as Record<string, string>}>
        <DonorAlertPagePage />
      </NavProvider>
  )
}

export const args = { id: 'r1' }

export const argTypes = { id: { control: 'select', options: ['r1', 'r5', 'r6'] } }