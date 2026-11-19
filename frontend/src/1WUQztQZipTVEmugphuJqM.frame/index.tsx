
import { NavProvider } from '../shared/bloodmatcher/nav'
import { Link } from '../shared/bloodmatcher/nav'
import { useNavigate } from '../shared/bloodmatcher/nav'

import { BloodBag, Heart } from '../shared/bloodmatcher/components/BmArt'
import { BmNav } from '../shared/bloodmatcher/components/BmNav'


const STEPS = [
  {
    title: 'A hospital posts a request',
    text: 'Blood type, units and urgency — critical requests start calling donors within a 5 km radius.',
  },
  {
    title: 'Nearby donors get alerted',
    text: 'Compatible donors around the hospital are notified. If nobody answers, the radius widens: 15, 30, then 60 km.',
  },
  {
    title: 'A donor accepts',
    text: 'The donor confirms they can come — the hospital sees who is on the way, with contact details.',
  },
] as const

/** Landing page: what Bloodmatcher does, with the two entry points and the 3-step explainer. */
function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="bm-page">
      <div className="bm-panel">
        <BmNav active="/" onNavigate={navigate} />

        <main className="bm-main bm-home">
          <Heart className="bm-heart bm-heart-1" />
          <Heart className="bm-heart bm-heart-2" />
          <Heart className="bm-heart bm-heart-3" />

          <section className="bm-intro" aria-labelledby="home-heading">
            <h1 id="home-heading" className="bm-title">
              Every
              <br />
              drop
            </h1>
            <p className="bm-script">finds its match</p>
            <div className="bm-dots" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => <span key={i} />)}
            </div>
            <p className="bm-tag">Together, we're stronger</p>
            <p className="bm-lede">
              Bloodmatcher connects hospitals that need blood with compatible donors nearby —
              so urgent requests find a matching donor in minutes, not days.
            </p>
            <div className="bm-hero-actions">
              <Link to="/register" className="bm-button">Register</Link>
              <Link to="/login" className="bm-button bm-button-ghost">Sign in</Link>
            </div>
          </section>

          <BloodBag />
          <p className="bm-follow">stay informed,<br />follow us</p>
        </main>

        <section className="bm-steps" aria-labelledby="how-heading">
          <h2 id="how-heading" className="bm-steps-title">How it works</h2>
          <ol className="bm-step-list">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bm-step">
                <span className="bm-step-num" aria-hidden="true">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="bm-home-foot">every drop finds its match</p>
      </div>
    </div>
  )
}


/* ---------- frame ---------- */

type Props = Partial<typeof args> & { onNavigate?: (path: string) => void }

export default function Home(props: Props) {
  const { onNavigate, ...rest } = { ...args, ...props }
  return (
    <NavProvider onNavigate={onNavigate} params={rest as Record<string, string>}>
      <HomePage />
    </NavProvider>
  )
}

export const args = {}

export const argTypes = {}
