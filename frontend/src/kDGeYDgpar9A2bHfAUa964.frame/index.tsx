
import { NavProvider } from '../shared/bloodmatcher/nav'
import { Link, useNavigate } from '../shared/bloodmatcher/nav'

import { BloodBag, Heart } from '../shared/bloodmatcher/components/BmArt'
import { BmNav } from '../shared/bloodmatcher/components/BmNav'


/** Shown for any unknown route. */
function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="bm-page">
      <div className="bm-panel">
        <BmNav onNavigate={navigate} />

        <main className="bm-main">
          <Heart className="bm-heart bm-heart-1" />
          <Heart className="bm-heart bm-heart-2" />
          <Heart className="bm-heart bm-heart-3" />

          <section className="bm-intro">
            <h1 className="bm-title">
              Wrong
              <br />
              turn
            </h1>
            <p className="bm-script">page not found</p>
            <div className="bm-dots" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => <span key={i} />)}
            </div>
            <p className="bm-tag">404</p>
            <p className="bm-lede">
              The page you’re looking for doesn’t exist or has moved.
            </p>
          </section>

          <section className="bm-card" aria-labelledby="nf-heading">
            <h2 id="nf-heading" className="bm-card-title">Page not found</h2>
            <p className="bm-card-lede">There’s no page at this address. Check the link, or head back to the start.</p>
            <Link to="/" className="bm-button">Back to Home</Link>
          </section>

          <BloodBag />
          <p className="bm-follow">stay informed,<br />follow us</p>
        </main>
      </div>
    </div>
  )
}


/* ---------- frame ---------- */

type Props = Partial<typeof args> & { onNavigate?: (path: string) => void }

export default function NotFound(props: Props) {
  const { onNavigate, ...rest } = { ...args, ...props }
  return (
    <NavProvider onNavigate={onNavigate} params={rest as Record<string, string>}>
      <NotFoundPage />
    </NavProvider>
  )
}

export const args = {}

export const argTypes = {}
