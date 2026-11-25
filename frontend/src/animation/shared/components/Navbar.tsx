import React from 'react'

import { Logo } from '../../../shared/bloodmatcher/components/BloodmatcherLogo'
import { Link } from '../nav/Nav'
import { buttonClass } from './buttonStyles'

type Props =
  | { variant: 'public' }
  | { variant: 'app'; roleLabel: string; onHome?: () => void }

/** Dark pill navbar shared by the landing page and signed-in screens. */
export function Navbar(props: Props) {
  return (
    <header className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <nav
        aria-label="Main"
        className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full bg-ink py-2 pl-4 pr-2 text-cream shadow-[0_10px_30px_-18px_rgba(38,34,34,0.7)] sm:pl-5"
      >
        <Link
          to="/"
          aria-label="BloodMatcher home"
          onClick={props.variant === 'app' && props.onHome ? (e) => {
            if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
              e.preventDefault()
              props.onHome?.()
            }
          } : undefined}
          className="flex shrink-0 items-center gap-2 rounded-full font-display text-lg font-semibold focus-visible:outline-pink"
        >
          <span className="hidden min-[360px]:inline-flex"><Logo size={28} tone="dark" /></span>
          <span className="min-[360px]:hidden"><LogoMark /></span>
        </Link>

        {props.variant === 'public' ? (
          <>
            <ul className="hidden items-center gap-1 md:flex">
              <li>
                <a href="#how-it-works" className={buttonClass('onDark', 'sm', 'focus-visible:outline-pink')}>
                  How it works
                </a>
              </li>
              <li><a href="#network" className={buttonClass('onDark', 'sm', 'focus-visible:outline-pink')}>Explore the map</a></li>
              <li>
                <a href="#faq" className={buttonClass('onDark', 'sm', 'focus-visible:outline-pink')}>
                  FAQ
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-1">
              <Link to="/login" className={buttonClass('onDark', 'sm', 'focus-visible:outline-pink')}>
                Sign in
              </Link>
              <Link to="/register" className={buttonClass('primary', 'sm', 'focus-visible:outline-pink')}>
                <span className="sm:hidden">Join</span>
                <span className="hidden sm:inline">Become a donor</span>
              </Link>
            </div>
          </>
        ) : (
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-cream">{props.roleLabel}</span>
        )}
      </nav>
    </header>
  )
}

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        d="M12 7 C10 3.5, 4 3, 3.5 8.5 C3.2 12.5, 7.5 16, 12 20 C16.5 16, 20.8 12.5, 20.5 8.5 C20 3, 14 3.5, 12 7 Z"
        fill="#EE4450"
      />
      <path d="M12 1.5 V7" stroke="#F8C3CC" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
