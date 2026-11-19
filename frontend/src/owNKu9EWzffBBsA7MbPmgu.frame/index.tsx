
import { NavProvider } from '../shared/bloodmatcher/nav'
import { Link } from '../shared/bloodmatcher/nav'

import { BmNav } from '../shared/bloodmatcher/components/BmNav'


/** Design reference: every shared empty, loading and error state in one page. Mock only. */
function StatesPagePage() {
  return (
    <div className="bm-page">
      <div className="bm-panel">
        <BmNav active="/states" />

        <main className="hd-main st-main">
          <div className="hd-head">
            <div className="hd-who">
              <h1 className="hd-name">States</h1>
              <p className="hd-meta">Shared empty states, loading skeletons and error banners — the vocabulary every screen reuses.</p>
            </div>
          </div>

          {/* ---- error banners ---- */}
          <section className="st-section" aria-labelledby="st-errors">
            <h2 id="st-errors" className="hd-section-title">Error banners</h2>

            <p className="st-label">Top-of-page banner — connectivity lost</p>
            <div className="st-banner" role="alert">
              <span>You're offline — some info may be out of date.</span>
              <button type="button" className="bm-ghost">Retry now</button>
            </div>

            <p className="st-label">Form error — inline under the fields</p>
            <p className="bm-error" role="alert">Invalid email or password</p>

            <p className="st-label">Panel problem — a screen failed to load</p>
            <div className="hd-problem" role="alert">
              <span className="hd-problem-title">The server is waking up or unreachable</span>
              <p>Please try again in a minute — cold starts usually take less than that.</p>
              <button type="button" className="bm-ghost">Try again</button>
            </div>

            <p className="st-label">Inline problem — inside a panel section</p>
            <div className="hd-inline-problem" role="alert">
              <p>Couldn't load the matched donors. Check your connection and retry.</p>
              <button type="button" className="bm-ghost">Retry</button>
            </div>
          </section>

          {/* ---- empty states ---- */}
          <section className="st-section" aria-labelledby="st-empty">
            <h2 id="st-empty" className="hd-section-title">Empty states</h2>

            <p className="st-label">Hospital dashboard — no requests yet</p>
            <div className="hd-empty">
              <span className="hd-empty-title">No requests yet</span>
              <p>When your hospital needs blood, post a request and nearby compatible donors will be alerted.</p>
              <Link to="/hospital" className="bm-ghost">Post a request</Link>
            </div>

            <p className="st-label">Donor dashboard — no alerts right now</p>
            <div className="hd-empty">
              <span className="hd-empty-title">No alerts right now</span>
              <p>We'll alert you as soon as a nearby hospital needs O−. Keep your availability switched on so we can reach you.</p>
            </div>

            <p className="st-label">Admin queue — nothing to verify</p>
            <div className="hd-empty">
              <span className="hd-empty-title">All caught up</span>
              <p>No hospitals are waiting for verification. New registrations will appear here.</p>
            </div>
          </section>

          {/* ---- loading skeletons ---- */}
          <section className="st-section" aria-labelledby="st-skeletons">
            <h2 id="st-skeletons" className="hd-section-title">Loading skeletons</h2>

            <p className="st-label">List skeleton — requests and alerts while they load</p>
            <ul className="hd-list" aria-hidden="true">
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

            <p className="st-label">Detail panel skeleton — title, meta and notes</p>
            <div className="bm-card hd-card" aria-hidden="true">
              <span className="hd-skel hd-skel--title" />
              <span className="hd-skel hd-skel--line" style={{ marginTop: 14 }} />
              <span className="hd-skel hd-skel--short" style={{ marginTop: 8 }} />
              <span className="hd-skel hd-skel--line" style={{ marginTop: 20, width: '100%', height: 56, borderRadius: 12 }} />
            </div>

            <p className="st-label">Stats row skeleton — admin</p>
            <div className="st-stats-skel" aria-hidden="true">
              <span className="st-skel" />
              <span className="st-skel" />
              <span className="st-skel" />
              <span className="st-skel" />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}


/* ---------- frame ---------- */

type Props = Partial<typeof args> & { onNavigate?: (path: string) => void }

export default function StatesPage(props: Props) {
  const { onNavigate, ...rest } = { ...args, ...props }
  return (
    <NavProvider onNavigate={onNavigate} params={rest as Record<string, string>}>
      <StatesPagePage />
    </NavProvider>
  )
}

export const args = {}

export const argTypes = {}
