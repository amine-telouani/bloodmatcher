import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { AccessState, type AccessKind } from '../shared/components/AccessState'
import { BmNav } from '../shared/components/BmNav'
import { ApiError } from '../shared/lib/api'
import { bloodLabel, formatAgo, STATUS_LABEL, URGENCY_LABEL } from '../shared/lib/blood'
import {
  hospitalApi,
  mockHospitalApi,
  type BloodRequest,
  type HospitalProfile,
} from '../shared/lib/hospitalApi'
import { clearSession, normaliseRole, readRawRole, readSession, type Session } from '../shared/lib/session'

import { RequestDetail } from './components/RequestDetail'
import { RequestForm } from './components/RequestForm'

import '../shared/styles/bloodmatch.css'
import '../shared/styles/dashboard.css'

export const args = {
  state: 'default',
  mockApi: true,
}

export const argTypes = {
  state: {
    control: 'select',
    options: ['default', 'loading', 'empty', 'error', 'signed-out', 'wrong-role', 'unknown-role'],
  },
  mockApi: { control: 'boolean' },
}

type Props = Partial<typeof args> & {
  onNavigate?: (path: string) => void
  onSignOut?: () => void
}

type Tab = 'active' | 'past'
type Panel = { kind: 'detail'; id: string } | { kind: 'create' } | null
type Flash = { requestId: string; text: string } | null

/** Stands in for a signed-in hospital when the preview has no stored session. */
const DEMO_SESSION: Session = {
  token: 'demo',
  role: 'hospital',
  user: { id: 'h1', email: 'bloodbank@stmarys.org', name: 'St. Mary’s General' },
}

export default function HospitalDashboard(props: Props) {
  const { state, mockApi, onNavigate, onSignOut } = { ...args, ...props }

  const stored = readSession()
  const rawRole = readRawRole()
  const session = stored ?? (mockApi && !rawRole ? DEMO_SESSION : null)
  const api = useMemo(() => (mockApi ? mockHospitalApi(session) : hospitalApi), [mockApi])

  const [expired, setExpired] = useState(false)
  const [load, setLoad] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadError, setLoadError] = useState('')
  const [profile, setProfile] = useState<HospitalProfile | null>(null)
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [tab, setTab] = useState<Tab>('active')
  const [panel, setPanel] = useState<Panel>(null)
  const [flash, setFlash] = useState<Flash>(null)

  const access: AccessKind | null =
    state === 'signed-out' || state === 'wrong-role' || state === 'unknown-role'
      ? state
      : expired
        ? 'expired'
        : rawRole && !normaliseRole(rawRole)
          ? 'unknown-role'
          : !session
            ? 'signed-out'
            : session.role !== 'hospital'
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
      const [p, r] = await Promise.all([api.profile(), api.requests()])
      setProfile(p)
      setRequests(r)
      setLoad('ready')
    } catch (err) {
      if (!fail(err)) {
        setLoadError(err instanceof ApiError ? err.message : 'We couldn’t load your dashboard.')
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
    if (onSignOut) onSignOut()
    else onNavigate?.('/login')
  }

  // Preview states from the `state` arg win over live data.
  const shownLoad = state === 'loading' ? 'loading' : state === 'error' ? 'error' : load
  const shownRequests = state === 'empty' ? [] : requests
  const active = shownRequests.filter((r) => r.status === 'OPEN')
  const past = shownRequests.filter((r) => r.status !== 'OPEN')
  const list = tab === 'active' ? active : past

  // On wide screens something is always open beside the list: the first request, or the form when there are none.
  const selected =
    panel?.kind === 'detail' ? shownRequests.find((r) => r.id === panel.id) ?? null : null
  const fallback = panel === null && shownLoad === 'ready' ? (list[0] ?? null) : null
  const shownPanel: Panel =
    panel ?? (fallback ? { kind: 'detail', id: fallback.id } : shownLoad === 'ready' && shownRequests.length === 0 ? { kind: 'create' } : null)
  const detail = selected ?? fallback

  function onCreated(req: BloodRequest) {
    setRequests((prev) => [req, ...prev])
    setTab('active')
    setPanel({ kind: 'detail', id: req.id })
    setFlash({
      requestId: req.id,
      text:
        req.matchedCount > 0
          ? `Request posted. ${req.matchedCount} compatible donor${req.matchedCount === 1 ? '' : 's'} nearby ${req.matchedCount === 1 ? 'has' : 'have'} been alerted.`
          : 'Request posted. No compatible donors are nearby yet — we’ll alert new ones as they join.',
    })
  }

  function onUpdated(req: BloodRequest) {
    setRequests((prev) => prev.map((r) => (r.id === req.id ? req : r)))
    setFlash({
      requestId: req.id,
      text: req.status === 'FULFILLED' ? 'Marked as fulfilled. Donors have been told they’re no longer needed.' : 'Request cancelled. Donors have been told it’s no longer needed.',
    })
  }

  return (
    <div className="bm-page">
      <div className="bm-panel">
        <BmNav
          active="/hospital"
          onNavigate={onNavigate}
          session={access ? null : session}
          onSignOut={signOut}
        />

        {access ? (
          <main className="hd-main">
            <AccessState
              kind={access}
              required="hospital"
              actual={state === 'wrong-role' ? 'donor' : session?.role}
              onNavigate={onNavigate}
              onSignOut={signOut}
            />
          </main>
        ) : (
          <main className="hd-main" data-panel={panel ? 'open' : 'closed'}>
            <header className="hd-head">
              <div className="hd-who">
                {shownLoad === 'ready' && profile ? (
                  <>
                    <h1 className="hd-name">{profile.name}</h1>
                    <p className="hd-meta">
                      <span>{profile.city}</span>
                      <span aria-hidden="true">·</span>
                      <span>{profile.email}</span>
                      <span aria-hidden="true">·</span>
                      <span className="hd-coords">
                        {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
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
              {shownLoad === 'ready' && (
                <button
                  type="button"
                  className="bm-button hd-new"
                  onClick={() => {
                    setFlash(null)
                    setPanel({ kind: 'create' })
                  }}
                >
                  New urgent request
                </button>
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
                <section className="hd-list-col" aria-labelledby="hd-requests">
                  <div className="hd-list-head">
                    <h2 id="hd-requests" className="hd-section-title">Blood requests</h2>
                    <div className="hd-tabs" role="tablist" aria-label="Request status">
                      {(['active', 'past'] as Tab[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          role="tab"
                          aria-selected={tab === t}
                          className={`hd-tab ${tab === t ? 'is-active' : ''}`}
                          onClick={() => {
                            setTab(t)
                            if (panel?.kind === 'detail') setPanel(null)
                          }}
                        >
                          {t === 'active' ? 'Active' : 'Past'}
                          {shownLoad === 'ready' && (
                            <span className="hd-count">{t === 'active' ? active.length : past.length}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

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
                        {tab === 'active'
                          ? shownRequests.length === 0
                            ? 'No requests yet'
                            : 'No active requests'
                          : 'Nothing here yet'}
                      </p>
                      <p>
                        {tab === 'active'
                          ? 'When you need blood, post a request and we’ll alert compatible donors near you straight away.'
                          : 'Fulfilled and cancelled requests will be kept here for your records.'}
                      </p>
                      {tab === 'active' && (
                        <button type="button" className="bm-ghost" onClick={() => setPanel({ kind: 'create' })}>
                          Post a request
                        </button>
                      )}
                    </div>
                  ) : (
                    <ul className="hd-list">
                      {list.map((r) => {
                        const isSel = shownPanel?.kind === 'detail' && shownPanel.id === r.id
                        return (
                          <li key={r.id}>
                            <button
                              type="button"
                              className={`hd-row ${isSel ? 'is-selected' : ''}`}
                              aria-current={isSel ? 'true' : undefined}
                              onClick={() => {
                                if (flash?.requestId !== r.id) setFlash(null)
                                setPanel({ kind: 'detail', id: r.id })
                              }}
                            >
                              <span className={`hd-type ${r.status !== 'OPEN' ? 'is-muted' : ''}`}>
                                {bloodLabel(r.bloodType)}
                              </span>
                              <span className="hd-row-body">
                                <span className="hd-row-top">
                                  <span className="hd-units">
                                    {r.units} unit{r.units === 1 ? '' : 's'}
                                  </span>
                                  {r.status === 'OPEN' ? (
                                    <span className={`hd-urgency hd-urgency--${r.urgency.toLowerCase()}`}>
                                      {URGENCY_LABEL[r.urgency]}
                                    </span>
                                  ) : (
                                    <span className={`hd-status hd-status--${r.status.toLowerCase()}`}>
                                      {STATUS_LABEL[r.status]}
                                    </span>
                                  )}
                                </span>
                                {r.notes && <span className="hd-row-notes">{r.notes}</span>}
                                <span className="hd-row-meta">
                                  Posted {formatAgo(r.createdAt)} · {r.acceptedCount} of {r.matchedCount} donors accepted
                                </span>
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>

                {shownPanel && (
                  <aside className="hd-side" aria-label={shownPanel.kind === 'create' ? 'New request' : 'Request details'}>
                    <button type="button" className="hd-back" onClick={() => setPanel(null)}>
                      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      All requests
                    </button>
                    {shownPanel.kind === 'create' ? (
                      <RequestForm
                        api={api}
                        onCreated={onCreated}
                        onAuthFailed={fail}
                        onCancel={shownRequests.length > 0 ? () => setPanel(null) : undefined}
                      />
                    ) : detail ? (
                      <RequestDetail
                        key={detail.id}
                        request={detail}
                        api={api}
                        flash={flash?.requestId === detail.id ? flash.text : null}
                        onUpdated={onUpdated}
                        onAuthFailed={fail}
                      />
                    ) : null}
                  </aside>
                )}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  )
}
