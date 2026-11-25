
import { useState } from 'react'
import type { AnchorHTMLAttributes } from 'react'

import { homeFor, type Session } from '../lib/session'
import { Logo } from './BloodmatcherLogo'

type Props = {
  active?: string
  onNavigate?: (path: string) => void
  /** When given, the nav shows the signed-in links and a sign-out button. */
  session?: Session | null
  onSignOut?: () => void
}

const PUBLIC_LINKS = [
  { href: '/register', label: 'Register' },
  { href: '/login', label: 'Sign in' },
]

/** Dark pill navigation. Collapses to a menu button under 768px. */
export function BmNav({ active, onNavigate, session, onSignOut }: Props) {
  const [open, setOpen] = useState(false)
  const links = session
    ? [{ href: homeFor(session.role), label: session.role === 'hospital' ? 'Requests' : 'Urgent requests' }]
    : PUBLIC_LINKS
  // The admin page is reached from its own link in the nav, shown only there.
  if (active === '/admin') links.push({ href: '/admin', label: 'Admin' })
  const go = (path: string) => {
    setOpen(false)
    if (onNavigate) onNavigate(path)
    else window.location.assign('/?screen=' + encodeURIComponent(path))
  }

  return (
    <nav className="bm-nav" aria-label="Main">
      <div className="bm-nav-bar">
        <BmLink
          href="/"
          className="bm-logo"
          aria-label="Bloodmatcher home"
          onNavigate={go}
        >
          <Logo size={28} tone="dark" />
        </BmLink>

        <button
          type="button"
          className="bm-menu-btn"
          aria-expanded={open}
          aria-controls="bm-nav-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <div id="bm-nav-menu" className={`bm-nav-menu ${open ? 'is-open' : ''}`}>
          {session?.user && (
            <span className="bm-nav-user" title={session.user.email}>
              {session.user.name || session.user.email}
            </span>
          )}
          <ul className="bm-nav-links">
            {links.map((l) => (
              <li key={l.href}>
                <BmLink
                  href={l.href}
                  onNavigate={go}
                  aria-current={active === l.href ? 'page' : undefined}
                  className={active === l.href ? 'is-active' : undefined}
                >
                  {l.label}
                </BmLink>
              </li>
            ))}
          </ul>
          {session && (
            <button
              type="button"
              className="bm-signout"
              onClick={() => {
                setOpen(false)
                onSignOut?.()
              }}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  onNavigate?: ((path: string) => void) | undefined
}

/** An anchor that hands in-app routes to `onNavigate` when one is given, and behaves normally otherwise. */
export function BmLink({ href, onNavigate, onClick, ...rest }: LinkProps) {
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e)
        if (!onNavigate || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        onNavigate(href)
      }}
      {...rest}
    />
  )
}

