
import { NavProvider } from '../shared/bloodmatcher/nav'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from '../shared/bloodmatcher/nav'

import { BmNav } from '../shared/bloodmatcher/components/BmNav'
import { bloodLabel, URGENCY_LABEL } from '../shared/bloodmatcher/lib/blood'
import type { Session } from '../shared/bloodmatcher/lib/session'


/* ---------- mock data (design mode — no backend calls) ---------- */

type StepState = 'done' | 'current' | 'pending' | 'skipped'

type Step = {
  radius: number
  time: string | null
  alerted: number
  declined: number
  accepted: number
  noAnswer: number
  state: StepState
  note?: string
}

type Final = { kind: 'active' | 'fulfilled' | 'expired' | 'cancelled'; title: string; text: string }

type Scenario = {
  id: string
  label: string
  steps: Step[]
  final: Final
  /** seconds until the next widening starts (active scenario only) */
  nextInSec?: number
}

const SCENARIOS: Scenario[] = [
  {
    id: 'active',
    label: 'Active',
    nextInSec: 7 * 60 + 12,
    steps: [
      { radius: 5, time: '14:05', alerted: 12, declined: 1, accepted: 0, noAnswer: 11, state: 'done' },
      { radius: 15, time: '14:15', alerted: 27, declined: 3, accepted: 0, noAnswer: 24, state: 'done' },
      { radius: 30, time: '14:25', alerted: 41, declined: 2, accepted: 0, noAnswer: 39, state: 'current' },
      { radius: 60, time: null, alerted: 0, declined: 0, accepted: 0, noAnswer: 0, state: 'pending' },
    ],
    final: {
      kind: 'active',
      title: 'Still widening — 30 km radius calling now',
      text: 'Donors within 30 km are being alerted. If nobody accepts before the next step, the radius widens to 60 km.',
    },
  },
  {
    id: 'fulfilled',
    label: 'Fulfilled',
    steps: [
      { radius: 5, time: '14:05', alerted: 12, declined: 1, accepted: 0, noAnswer: 11, state: 'done' },
      {
        radius: 15,
        time: '14:15',
        alerted: 27,
        declined: 2,
        accepted: 1,
        noAnswer: 24,
        state: 'done',
        note: 'Lena Fischer accepted at 14:22 — the hospital has her contact details.',
      },
      { radius: 30, time: null, alerted: 0, declined: 0, accepted: 0, noAnswer: 0, state: 'skipped' },
      { radius: 60, time: null, alerted: 0, declined: 0, accepted: 0, noAnswer: 0, state: 'skipped' },
    ],
    final: {
      kind: 'fulfilled',
      title: 'Fulfilled — a donor accepted',
      text: 'The request closed 17 minutes after it was posted. The wider radii were never needed.',
    },
  },
  {
    id: 'expired',
    label: 'Expired',
    steps: [
      { radius: 5, time: '14:05', alerted: 12, declined: 1, accepted: 0, noAnswer: 11, state: 'done' },
      { radius: 15, time: '14:15', alerted: 27, declined: 3, accepted: 0, noAnswer: 24, state: 'done' },
      { radius: 30, time: '14:25', alerted: 41, declined: 2, accepted: 0, noAnswer: 39, state: 'done' },
      { radius: 60, time: '14:35', alerted: 58, declined: 4, accepted: 0, noAnswer: 54, state: 'done' },
    ],
    final: {
      kind: 'expired',
      title: 'Expired — the response deadline passed',
      text: 'All four radii were tried and no donor accepted before the deadline at 15:35. Post the request again or contact the regional blood bank.',
    },
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    steps: [
      { radius: 5, time: '14:05', alerted: 12, declined: 1, accepted: 0, noAnswer: 11, state: 'done' },
      { radius: 15, time: '14:15', alerted: 27, declined: 3, accepted: 0, noAnswer: 24, state: 'done' },
      { radius: 30, time: null, alerted: 0, declined: 0, accepted: 0, noAnswer: 0, state: 'skipped' },
      { radius: 60, time: null, alerted: 0, declined: 0, accepted: 0, noAnswer: 0, state: 'skipped' },
    ],
    final: {
      kind: 'cancelled',
      title: 'Cancelled by the hospital at 14:21',
      text: 'The request was withdrawn while the 15 km radius was still calling. Alerted donors were told it is no longer needed.',
    },
  },
]

const REQUEST = {
  id: 'r-2093',
  bloodType: 'O_NEG',
  units: 3,
  urgency: 'CRITICAL',
  hospital: 'St. Marien Hospital',
  city: 'Munich',
  createdAt: '14:05',
  deadline: '15:35',
  note: 'Trauma bay — need O-negative for surgery tonight.',
}

/* ---------- component ---------- */

function RequestTimelinePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [scenarioId, setScenarioId] = useState<string>('active')
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]!

  // live countdown for the active scenario's next widening
  const [remaining, setRemaining] = useState<number | null>(scenario.nextInSec ?? null)
  useEffect(() => {
    setRemaining(scenario.nextInSec ?? null)
    if (scenario.nextInSec === undefined) return
    const t = setInterval(() => setRemaining((r) => (r === null ? null : Math.max(0, r - 1))), 1000)
    return () => clearInterval(t)
  }, [scenario])

  const totalAlerted = scenario.steps.reduce((sum, s) => sum + s.alerted, 0)
  const totalDeclined = scenario.steps.reduce((sum, s) => sum + s.declined, 0)
  const totalAccepted = scenario.steps.reduce((sum, s) => sum + s.accepted, 0)

  const mmss = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

  return (
    <div className="bm-page">
      <div className="bm-panel">
        <BmNav active="/hospital" onNavigate={navigate} onSignOut={() => {}} />

        <main className="hd-main">
          <div className="hd-head">
            <div className="hd-who">
              <Link to="/hospital" className="hd-back">← Back to requests</Link>
              <h1 className="hd-name">Escalation</h1>
              <p className="hd-meta">
                <span>{REQUEST.hospital}</span>
                <span>·</span>
                <span>{REQUEST.city}</span>
                <span>·</span>
                <span>{bloodLabel(REQUEST.bloodType)} · {REQUEST.units} units</span>
                <span>·</span>
                <span className={`hd-urgency hd-urgency--${REQUEST.urgency.toLowerCase()}`}>
                  {URGENCY_LABEL[REQUEST.urgency as keyof typeof URGENCY_LABEL] ?? 'Critical'}
                </span>
              </p>
            </div>
          </div>

          <div className="hd-layout">
            <div className="hd-list-col">
              {/* design-preview outcome switcher */}
              <div>
                <div className="hd-list-head">
                  <h2 className="hd-section-title">Outcome preview</h2>
                </div>
                <div className="hd-tabs" role="tablist" aria-label="Outcome preview">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={s.id === scenarioId}
                      className={`hd-tab ${s.id === scenarioId ? 'is-active' : ''}`}
                      onClick={() => setScenarioId(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* per-step alerting stats */}
              <div className="tl-chips">
                <span className="tl-chip">
                  <span className="tl-chip-num is-red">{totalAlerted}</span>
                  <span className="tl-chip-label">Donors alerted</span>
                </span>
                <span className="tl-chip">
                  <span className="tl-chip-num">{totalDeclined}</span>
                  <span className="tl-chip-label">Declined</span>
                </span>
                <span className="tl-chip">
                  <span className="tl-chip-num">{totalAccepted}</span>
                  <span className="tl-chip-label">Accepted</span>
                </span>
                <span className="tl-chip">
                  <span className="tl-chip-num">{REQUEST.deadline}</span>
                  <span className="tl-chip-label">Response deadline</span>
                </span>
              </div>

              {/* the timeline itself */}
              <div>
                <ol className="tl-steps">
                  {scenario.steps.map((step) => (
                    <li key={step.radius} className={`tl-step is-${step.state}`}>
                      <span className="tl-node" aria-hidden="true">{step.radius}</span>
                      <div className="tl-body">
                        <div className="tl-head">
                          <span className="tl-radius">{step.radius} km radius</span>
                          {step.time && <span className="tl-time">started {step.time}</span>}
                          {step.state === 'current' && remaining !== null && (
                            <span className="tl-countdown">next step in {mmss(remaining)}</span>
                          )}
                          {step.state === 'pending' && <span className="tl-time">starts if nobody accepts</span>}
                          {step.state === 'skipped' && <span className="tl-time">not needed</span>}
                        </div>
                        {step.state !== 'pending' && step.state !== 'skipped' && (
                          <p className="tl-stats">
                            <strong>{step.alerted}</strong> donors alerted
                            {' · '}<strong>{step.declined}</strong> declined
                            {' · '}<strong>{step.accepted}</strong> accepted
                            {step.noAnswer > 0 && <> · {step.noAnswer} no answer yet</>}
                          </p>
                        )}
                        {step.note && <p className="tl-note">{step.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>

                <div className={`tl-final tl-final--${scenario.final.kind}`}>
                  <p className="tl-final-title">{scenario.final.title}</p>
                  <p>{scenario.final.text}</p>
                </div>
              </div>
            </div>

            {/* request summary card */}
            <aside className="hd-side">
              <div className="bm-card hd-card">
                <div className="hd-detail-head">
                  <span className="hd-type hd-type--lg" aria-hidden="true">{bloodLabel(REQUEST.bloodType)}</span>
                  <div className="hd-detail-titles">
                    <h2 className="hd-detail-title">Request #{(id ?? REQUEST.id.replace('r-', '')).replace(/^r-/, '')}</h2>
                    <p className="hd-detail-sub">
                      <span className={`hd-urgency hd-urgency--${REQUEST.urgency.toLowerCase()}`}>
                        {URGENCY_LABEL[REQUEST.urgency as keyof typeof URGENCY_LABEL] ?? 'Critical'}
                      </span>
                      <span>{REQUEST.units} units</span>
                    </p>
                  </div>
                </div>
                <p className="hd-notes">{REQUEST.note}</p>
                <p className="hd-card-lede" style={{ marginTop: 14 }}>
                  Posted {REQUEST.createdAt} · response window ends {REQUEST.deadline}.
                  Each widening waits 10 minutes for responses before calling the next radius.
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}


/* ---------- frame ---------- */

type Props = Partial<typeof args> & { onNavigate?: (path: string) => void }

export default function RequestTimeline(props: Props) {
  const { onNavigate, ...rest } = { ...args, ...props }
  return (
    <NavProvider onNavigate={onNavigate} params={rest as Record<string, string>}>
      <RequestTimelinePage />
    </NavProvider>
  )
}

export const args = { id: 'r1' }

export const argTypes = { id: { control: 'text' } }
