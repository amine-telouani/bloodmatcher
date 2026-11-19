
import { NavProvider } from '../shared/bloodmatcher/nav'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNavigate } from '../shared/bloodmatcher/nav'

import { AccessState, type AccessKind } from '../shared/bloodmatcher/components/AccessState'
import { BmNav } from '../shared/bloodmatcher/components/BmNav'
import { ApiError } from '../shared/bloodmatcher/lib/api'
import { bloodLabel, formatAgo, STATUS_LABEL, URGENCY_LABEL } from '../shared/bloodmatcher/lib/blood'
import { mockDonorApi, nextEligibleDate, type DonorAlert, type DonorProfile } from '../shared/bloodmatcher/lib/donorApi'
import { clearSession, normaliseRole, readRawRole, readSession, type Session } from '../shared/bloodmatcher/lib/session'

import { AlertDetail } from '../shared/bloodmatcher/components/donor/AlertDetail'
import { AvailabilitySwitch } from '../shared/bloodmatcher/components/donor/AvailabilitySwitch'
import { DonorProfileForm } from '../shared/bloodmatcher/components/donor/ProfileForm'


/* profile card shares the register form styles */

type Tab = 'waiting' | 'answered'
type Flash = { requestId: string; text: string } | null

function DonorDashboardPage() {
  const navigate = useNavigate()

  const stored = readSession()
  const rawRole = readRawRole()
  const session = stored
  const api = useMemo(() => mockDonorApi(session), [session])

  const [expired, setExpired] = useState(false)
  const [load, setLoad] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadError, setLoadError] = useState('')
  const [profile, setProfile] = useState<DonorProfile | null>(null)
  const [alerts, setAlerts] = useState<DonorAlert[]>([])
  const [tab, setTab] = useState<Tab>('waiting')
  const [openId, setOpenId] = useState<string | null>(null)
  const [flash, setFlash] = useState<Flash>(null)

  const access: AccessKind | null =
    expired
        ? 'expired'
        : rawRole && !normaliseRole(rawRole)
          ? 'unknown-role'
          : !session
            ? 'signed-out'
            : session.role !== 'donor'
              ? 'wrong-role'
              : null

  const fail = useCallback((err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      setExpired(true)
      return true
    }
    return false
  }, [])

  const fetchAll = useCallback(async () => {
    setLoad('loading')
    try {
      const [p, a] = await Promise.all([api.profile(), api.alerts()])
      setProfile(p)
      setAlerts(a)
      setLoad('ready')
    } catch (err) {
      if (!fail(err)) {
        setLoadError(err instanceof ApiError ? err.message : 'We couldn’t load your requests.')
        setLoad('error')
      }
    }
  }, [api, fail])

  useEffect(() => {
    if (!access) fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access === null])

  function signOut() {
    clearSession()
    navigate('/login')
  }

  const shownLoad = load
  const shownAlerts = alerts
  const waiting = shownAlerts.filter((a) => a.status === 'OPEN' && a.response === 'PENDING')
  const answered = shownAlerts.filter((a) => !(a.status === 'OPEN' && a.response === 'PENDING'))
  const list = tab === 'waiting' ? waiting : answered

  // On wide screens the first request in the list is always open beside it.
  const chosen = openId ? shownAlerts.find((a) => a.requestId === openId) ?? null : null
  const detail = chosen ?? (shownLoad === 'ready' ? list[0] ?? null : null)
  const eligibleFrom = profile ? nextEligibleDate(profile.lastDonationAt) : null

  function onResponded(a: DonorAlert) {
    setAlerts((prev) => prev.map((x) => (x.requestId === a.requestId ? a : x)))
    setTab('answered')
    setOpenId(a.requestId)
    setFlash({
      requestId: a.requestId,
      text:
        a.response === 'ACCEPTED'
          ? `Thank you. ${a.hospitalName} has been told you’re coming.`
          : `Got it. ${a.hospitalName} won’t expect you for this one.`,
    })
  }

  return (
    <div className="bm-page">
      <div className="bm-panel">
        <BmNav active="/donor" onNavigate={navigate} session={access ? null : session} onSignOut={signOut} />

        {access ? (
          <main className="hd-main">
            <AccessState
              kind={access}
              required="donor"
              actual={session?.role ?? null}
              onNavigate={navigate}
              onSignOut={signOut}
            />
          </main>
        ) : (
          <main className="hd-main" data-panel={openId ? 'open' : 'closed'}>
            <header className="hd-head">
              <div className="hd-who">
                {shownLoad === 'ready' && profile ? (
                  <>
                    <h1 className="hd-name">{profile.fullName}</h1>
                    <p className="hd-meta">
                      <span className="dd-blood">{bloodLabel(profile.bloodType)} donor</span>
                      <span aria-hidden="true">·</span>
                      <span>{profile.city}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {eligibleFrom
                          ? `You can donate again from ${eligibleFrom.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}`
                          : 'Eligible to donate now'}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <span className="hd-skel hd-skel--title" />
                    <span className="hd-skel hd-skel--line" />
                  </>
                )}
              </div>
              {shownLoad === 'ready' && profile && (
                <AvailabilitySwitch
                  available={profile.available}
                  api={api}
                  onChanged={setProfile}
                  onAuthFailed={fail}
                />
              )}
            </header>

            {shownLoad === 'error' ? (
              <div className="hd-problem" role="alert">
                <p className="hd-problem-title">We couldn’t load your requests.</p>
                <p>{loadError || 'Can’t reach Bloodmatcher right now. Check your connection and try again.'}</p>
                <button type="button" className="bm-ghost" onClick={fetchAll}>
                  Try again
                </button>
              </div>
            ) : (
              <div className="hd-layout">
                <section className="hd-list-col" aria-labelledby="dd-requests">
                  <div className="hd-list-head">
                    <h2 id="dd-requests" className="hd-section-title">Requests near you</h2>
                    <div className="hd-tabs" role="tablist" aria-label="Request filter">
                      {(['waiting', 'answered'] as Tab[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          role="tab"
                          aria-selected={tab === t}
                          className={`hd-tab ${tab === t ? 'is-active' : ''}`}
                          onClick={() => {
                            setTab(t)
                            setOpenId(null)
                          }}
                        >
                          {t === 'waiting' ? 'Needs your answer' : 'Answered'}
                          {shownLoad === 'ready' && (
                            <span className="hd-count">{t === 'waiting' ? waiting.length : answered.length}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {shownLoad === 'ready' && profile && !profile.available && (
                    <p className="dd-paused" role="status">
                      You’re paused, so hospitals won’t alert you to new requests. You can still answer the ones below.
                    </p>
                  )}

                  {shownLoad === 'loading' ? (
                    <ul className="hd-list" aria-busy="true" aria-label="Loading requests">
                      {[0, 1, 2].map((i) => (
                        <li key={i} className="hd-row hd-row--skel">
                          <span className="hd-skel hd-skel--badge" />
                          <span className="hd-skel-stack">
                            <span className="hd-skel hd-skel--line" />
                            <span className="hd-skel hd-skel--short" />
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : list.length === 0 ? (
                    <div className="hd-empty">
                      <p className="hd-empty-title">
                        {tab === 'waiting' ? 'Nothing needs you right now' : 'No answers yet'}
                      </p>
                      <p>
                        {tab === 'waiting'
                          ? 'When a hospital near you needs blood you can give, it will appear here and we’ll alert you.'
                          : 'Requests you’ve said yes or no to are kept here, with the hospital’s details.'}
                      </p>
                    </div>
                  ) : (
                    <ul className="hd-list">
                      {list.map((a) => {
                        const isSel = detail?.requestId === a.requestId
                        const live = a.status === 'OPEN'
                        return (
                          <li key={a.requestId}>
                            <button
                              type="button"
                              className={`hd-row ${isSel ? 'is-selected' : ''}`}
                              aria-current={isSel ? 'true' : undefined}
                              onClick={() => {
                                if (flash?.requestId !== a.requestId) setFlash(null)
                                setOpenId(a.requestId)
                              }}
                            >
                              <span className={`hd-type ${live ? '' : 'is-muted'}`}>{bloodLabel(a.bloodType)}</span>
                              <span className="hd-row-body">
                                <span className="hd-row-top">
                                  <span className="hd-units">{a.hospitalName}</span>
                                  {!live ? (
                                    <span className={`hd-status hd-status--${a.status.toLowerCase()}`}>
                                      {STATUS_LABEL[a.status]}
                                    </span>
                                  ) : a.response === 'PENDING' ? (
                                    <span className={`hd-urgency hd-urgency--${a.urgency.toLowerCase()}`}>
                                      {URGENCY_LABEL[a.urgency]}
                                    </span>
                                  ) : (
                                    <span className={`hd-resp hd-resp--${a.response.toLowerCase()}`}>
                                      {a.response === 'ACCEPTED'
                                        ? 'You’re going'
                                        : a.response === 'DONATED'
                                          ? 'You donated'
                                          : 'You declined'}
                                    </span>
                                  )}
                                </span>
                                {a.notes && <span className="hd-row-notes">{a.notes}</span>}
                                <span className="hd-row-meta">
                                  {a.units} unit{a.units === 1 ? '' : 's'} · {a.distanceKm.toFixed(1)} km away · posted{' '}
                                  {formatAgo(a.createdAt)}
                                </span>
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>

                {detail && (
                  <aside className="hd-side" aria-label="Request details">
                    <button type="button" className="hd-back" onClick={() => setOpenId(null)}>
                      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      All requests
                    </button>
                    <AlertDetail
                      key={detail.requestId}
                      alert={detail}
                      api={api}
                      eligibleFrom={eligibleFrom}
                      flash={flash?.requestId === detail.requestId ? flash.text : null}
                      onResponded={onResponded}
                      onAuthFailed={fail}
                    />
                  </aside>
                )}
              </div>
            )}

            {shownLoad === 'ready' && profile && (
              <DonorProfileForm profile={profile} api={api} onSaved={setProfile} onAuthFailed={fail} />
            )}
          </main>
        )}
      </div>
    </div>
  )
}


/* ---------- frame ---------- */

type Props = Partial<typeof args> & { onNavigate?: (path: string) => void }

export default function DonorDashboard(props: Props) {
  const { onNavigate, ...rest } = { ...args, ...props }
  return (
    <NavProvider onNavigate={onNavigate} params={rest as Record<string, string>}>
      <DonorDashboardPage />
    </NavProvider>
  )
}

export const args = {}

export const argTypes = {}
