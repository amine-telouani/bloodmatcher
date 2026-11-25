import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useScroll } from 'framer-motion'
import { ArrowRight, Info, X } from 'lucide-react'

import { NavProvider, Link, type AppPath } from '../shared/nav/Nav'
import { Navbar } from '../shared/components/Navbar'
import { Reveal } from '../shared/components/Reveal'
import { RequestCard } from '../shared/components/RequestCard'
import { DonationWindowCard } from '../shared/components/DonationWindowCard'
import { buttonClass } from '../shared/components/buttonStyles'
import { useChoreography } from '../shared/hooks/useChoreography'
import { SAMPLE_REQUESTS, SAMPLE_DONORS } from '../shared/preview/sampleData'
import { EASE_OUT, SECTION_TONES, type SectionTone } from '../shared/tokens'

import { HeroIllustration } from './components/HeroIllustration'
import { ScrollGuide } from './components/ScrollGuide'
import { BenefitGlyph } from './components/BenefitGlyph'
import { RadiusDiagram } from './components/RadiusDiagram'
import { CommunityGallery } from './components/CommunityGallery'
import { NetworkMap } from './components/NetworkMap'
import { FaqList } from './components/FaqList'
import { useSectionBackdrop } from './components/useSectionBackdrop'

type Props = Partial<typeof args> & {
  /** Opens the donor dashboard preview (interface preview only). */
  onOpenPreview?: () => void
  /** Real app navigation. In the prototype, routes show a note instead. */
  onNavigate?: (to: AppPath) => void
}

export default function Landing(props: Props) {
  const { headline, onOpenPreview, onNavigate } = { ...args, ...props }
  const rootRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const { mode, reduced } = useChoreography()
  const backdrop = useSectionBackdrop(rootRef)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const [routeNote, setRouteNote] = useState<AppPath | null>(null)

  useEffect(() => {
    if (!routeNote) return
    const t = window.setTimeout(() => setRouteNote(null), 3200)
    return () => window.clearTimeout(t)
  }, [routeNote])

  const navigate = (to: AppPath) => (onNavigate ? onNavigate(to) : setRouteNote(to))
  const tone = (t: SectionTone) => (reduced ? { backgroundColor: SECTION_TONES[t] } : undefined)

  return (
    <MotionConfig reducedMotion="user">
      <NavProvider navigate={navigate}>
        <motion.div
          ref={rootRef}
          style={reduced ? { backgroundColor: SECTION_TONES.cream } : { backgroundColor: backdrop }}
          className="animation-page relative min-w-0 overflow-x-clip font-sans text-ink"
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
          >
            Skip to content
          </a>
          <Navbar variant="public" />

          <main id="main">
            {/* 1 · Hero */}
            <section
              ref={heroRef}
              data-tone="cream"
              style={tone('cream')}
              aria-labelledby="hero-title"
              className="relative isolate overflow-hidden pt-12 pb-20 sm:pt-16 md:pb-36"
            >
              <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 md:grid-cols-[1.05fr_1fr] md:gap-6">
                <div className="relative z-10 max-w-xl">
                  <Reveal>
                    <p className="text-[15px] font-medium text-ink-soft">For blood donors and hospital staff</p>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <h1
                      id="hero-title"
                      className="mt-3 font-display text-[44px] font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl"
                    >
                      {headline}
                    </h1>
                  </Reveal>
                  <Reveal delay={0.12}>
                    <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
                      BloodMatcher connects hospitals with compatible donors nearby. A hospital posts what it needs; donors whose
                      blood type matches get a targeted alert and decide whether to accept.
                    </p>
                  </Reveal>
                  <Reveal delay={0.18}>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <Link to="/register" className={buttonClass('primary', 'lg')}>
                        Become a donor
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                      <a href="#how-it-works" className={buttonClass('secondary', 'lg')}>
                        For hospitals
                      </a>
                    </div>
                    <p className="mt-5 text-[15px] text-ink-soft">
                      Already registered?{' '}
                      <Link to="/login" className={buttonClass('quiet')}>
                        Sign in
                      </Link>
                    </p>
                  </Reveal>
                </div>

                <div className="pointer-events-none relative isolate mx-auto w-full overflow-hidden max-w-[340px] sm:max-w-[420px] md:max-w-[500px]">
                  <HeroIllustration progress={heroProgress} mode={mode} />
                </div>
              </div>
              {mode === 'full' && <ScrollGuide progress={heroProgress} />}
            </section>

            {/* 2 · Why it matters */}
            <section
              data-tone="blush"
              style={tone('blush')}
              aria-labelledby="why-title"
              className="relative py-20 sm:py-28"
            >
              <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                <Reveal className="lg:pt-2">
                  <h2 id="why-title" className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                    Asking the right people, not everyone
                  </h2>
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
                    A request is only useful if it reaches someone who can answer it. BloodMatcher narrows every alert to donors
                    who match, are nearby, and have said they're available.
                  </p>
                  <p aria-hidden className="mt-6 font-hand text-2xl text-red-deep">
                    together, we're stronger
                  </p>
                  <figure className="mt-7 max-w-md overflow-hidden rounded-[24px] bg-paper ring-1 ring-ink/10">
                    <img src="/images/community/giving-together.jpg" alt="A donor smiling and giving a thumbs-up at a blood drive" width="1000" height="625" loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
                    <figcaption className="px-4 py-3 text-sm text-muted">A small act, a human connection. Illustrative stock photograph.</figcaption>
                  </figure>
                </Reveal>
                <ul className="divide-y divide-ink/15 border-y border-ink/15">
                  {BENEFITS.map((b, i) => (
                    <li key={b.title}>
                      <Reveal delay={i * 0.07} className="grid grid-cols-[56px_1fr] gap-5 py-7 sm:grid-cols-[72px_1fr]">
                        <BenefitGlyph kind={b.glyph} />
                        <div className="min-w-0">
                          <h3 className="font-display text-2xl font-semibold">{b.title}</h3>
                          <p className="mt-2 leading-relaxed text-ink-soft">{b.body}</p>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 3 · How it works */}
            <section
              id="how-it-works"
              data-tone="cream"
              style={tone('cream')}
              aria-labelledby="how-title"
              className="scroll-mt-24 py-20 sm:py-28"
            >
              <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <Reveal>
                  <h2 id="how-title" className="max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
                    From a hospital's request to a confirmed donation
                  </h2>
                </Reveal>
                <div className="mt-12 grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
                  <ol className="relative">
                    <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-px bg-red/50" />
                    {STEPS.map((s, i) => (
                      <li key={s.title} className="relative">
                        <Reveal delay={i * 0.08} className="grid grid-cols-[40px_1fr] gap-5 pb-9 last:pb-0">
                          <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-cream font-display text-lg font-semibold text-red-dark ring-2 ring-red-dark">
                            {i + 1}
                          </span>
                          <div className="min-w-0 pt-1">
                            <p className="text-sm font-medium text-muted">{s.actor}</p>
                            <h3 className="mt-0.5 font-display text-xl font-semibold sm:text-2xl">{s.title}</h3>
                            <p className="mt-1.5 max-w-md leading-relaxed text-ink-soft">{s.body}</p>
                          </div>
                        </Reveal>
                      </li>
                    ))}
                  </ol>
                  <Reveal delay={0.1}>
                    <figure className="mx-auto w-full max-w-[420px]">
                      <RadiusDiagram />
                      <figcaption className="mt-4 text-center text-[15px] leading-relaxed text-ink-soft">
                        The search starts close to the hospital and widens in steps — 5, 15, 30, then 60 km — so the
                        nearest compatible donors hear first.
                      </figcaption>
                    </figure>
                  </Reveal>
                </div>
              </div>
            </section>

            <CommunityGallery />

            {/* 4 · Interface preview */}
            <section
              data-tone="pink"
              style={tone('pink')}
              aria-labelledby="preview-title"
              className="py-20 sm:py-28"
            >
              <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                  <div className="max-w-xl">
                    <h2 id="preview-title" className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                      Interface preview
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                      What a donor sees: requests marked by urgency, and when their next donation window opens.
                    </p>
                  </div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-paper/80 px-3.5 py-1.5 text-sm font-medium text-ink ring-1 ring-ink/15">
                    <Info className="h-4 w-4 shrink-0" aria-hidden />
                    Sample data — not live requests
                  </p>
                </Reveal>

                <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                  <ul className="flex flex-col gap-4" aria-label="Sample requests">
                    {SAMPLE_REQUESTS.map((r, i) => (
                      <li key={r.id}>
                        <Reveal delay={i * 0.06}>
                          <RequestCard request={r} />
                        </Reveal>
                      </li>
                    ))}
                  </ul>
                  <Reveal delay={0.12} className="flex flex-col gap-4">
                    <DonationWindowCard
                      lastDonationDate={SAMPLE_DONORS.waiting.lastDonationDate}
                      available={SAMPLE_DONORS.waiting.available}
                    />
                    <div className="rounded-3xl bg-paper/70 p-5 ring-1 ring-ink/10">
                      <p className="leading-relaxed text-ink-soft">
                        The bag shows urgency at a glance — fuller for normal, nearly empty for critical — always with a written
                        label. It's a symbol, not a stock level.
                      </p>
                      {onOpenPreview && (
                        <button type="button" onClick={onOpenPreview} className={buttonClass('quiet', 'md', 'mt-3 text-[15px]')}>
                          Open the dashboard preview
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  </Reveal>
                </div>
              </div>
            </section>

            {/* 5 · Sample testimonials */}
            <section
              data-tone="blush"
              style={tone('blush')}
              aria-labelledby="voices-title"
              className="py-20 sm:py-28"
            >
              <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <Reveal>
                  <h2 id="voices-title" className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                    How it's meant to feel
                  </h2>
                </Reveal>
                <div className="mt-10 grid gap-5 md:grid-cols-2">
                  {TESTIMONIALS.map((t, i) => (
                    <Reveal key={t.role} delay={i * 0.08} className="h-full">
                      <figure className="flex h-full flex-col rounded-[28px] bg-paper p-6 ring-1 ring-ink/10 sm:p-8">
                        <span className="self-start rounded-full bg-blush px-3 py-1 text-xs font-semibold text-red-deep">
                          Sample testimonial
                        </span>
                        <blockquote className="mt-5 font-display text-xl font-medium leading-snug sm:text-2xl">
                          “{t.quote}”
                        </blockquote>
                        <figcaption className="mt-auto flex items-center gap-3 pt-7">
                          <img src={t.portrait} alt="" width="80" height="80" loading="lazy" decoding="async" className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-ink/10" />
                          <div>
                            <p className="font-medium">{t.role}</p>
                            <p className="text-sm text-muted">Illustrative, not a real endorsement</p>
                          </div>
                        </figcaption>
                      </figure>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>

            {/* 6 · FAQ */}
            <section
              id="faq"
              data-tone="cream"
              style={tone('cream')}
              aria-labelledby="faq-title"
              className="scroll-mt-24 py-20 sm:py-28"
            >
              <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                <Reveal>
                  <h2 id="faq-title" className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                    Questions donors ask first
                  </h2>
                </Reveal>
                <Reveal delay={0.08}>
                  <FaqList />
                </Reveal>
              </div>
            </section>

            <NetworkMap />

            {/* Closing CTA + footer */}
            <section data-tone="pink" style={tone('pink')} aria-labelledby="cta-title" className="pt-20 sm:pt-28">
              <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <Reveal className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
                  <CtaHeart />
                  <div>
                    <h2 id="cta-title" className="max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
                      Be on the list when a match is needed near you.
                    </h2>
                    <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink">
                      Register once with your blood type and location. You'll only hear from us when a compatible request comes
                      up nearby — and you can always say no.
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                      <Link to="/register" className={buttonClass('primary', 'lg')}>
                        Become a donor
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                      <p className="text-[15px] text-ink">
                        Hospital staff?{' '}
                        <Link to="/login" className={buttonClass('quiet')}>
                          Sign in to post a request
                        </Link>
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>

              <footer className="mx-auto mt-20 max-w-6xl px-5 pb-10 sm:px-8">
                <div className="flex flex-col gap-5 border-t border-ink/20 pt-6 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    <span className="font-display text-base font-semibold">BloodMatcher</span> · a student-built project
                  </p>
                  <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
                    <a href="#how-it-works" className="hover:underline">
                      How it works
                    </a>
                    <a href="#faq" className="hover:underline">
                      FAQ
                    </a>
                    <Link to="/login" className="hover:underline">
                      Sign in
                    </Link>
                    <Link to="/register" className="hover:underline">
                      Register
                    </Link>
                  </nav>
                </div>
              </footer>
            </section>
          </main>

          <AnimatePresence>
            {routeNote && (
              <motion.div
                role="status"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-full bg-ink py-2.5 pl-5 pr-2 text-sm text-cream"
              >
                <span className="min-w-0 flex-1">
                  In the app this opens <code className="font-semibold">{routeNote}</code>
                </span>
                <button
                  type="button"
                  onClick={() => setRouteNote(null)}
                  aria-label="Dismiss"
                  className="rounded-full p-1.5 transition-colors duration-150 hover:bg-white/10"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </NavProvider>
    </MotionConfig>
  )
}

export const args = {
  headline: 'Every drop finds its match.',
}

export const argTypes = {
  headline: { control: 'text' },
}

const BENEFITS = [
  {
    glyph: 'compatible' as const,
    title: 'Compatible matching',
    body: 'Each request names a blood type. Only donors whose type is compatible are alerted, so an alert is one you could actually answer.',
  },
  {
    glyph: 'local' as const,
    title: 'Local reach',
    body: 'Alerts go to donors closest to the hospital first, and the search widens only when it needs to.',
  },
  {
    glyph: 'control' as const,
    title: 'Controlled alerts',
    body: "Donors switch their availability on or off, and accept or decline each request. No mass broadcasts, no pressure.",
  },
]

const STEPS = [
  {
    actor: 'Hospital',
    title: 'Posts a request',
    body: 'Staff enter the blood type, units needed, urgency and a deadline.',
  },
  {
    actor: 'BloodMatcher',
    title: 'Alerts compatible donors nearby',
    body: 'Available donors with a compatible type get a targeted alert, starting closest to the hospital.',
  },
  {
    actor: 'Donor',
    title: 'Accepts the request',
    body: "Accepting tells the hospital you intend to come in. It isn't a donation yet.",
  },
  {
    actor: 'Hospital',
    title: 'Confirms the donation',
    body: "Staff record the donation once it's complete. That date starts the donor's 90-day waiting period in the app.",
  },
]

const TESTIMONIALS = [
  {
    role: 'Donor',
    portrait: '/images/testimonials/portrait-donor.jpg',
    quote:
      "I only hear about requests my blood type can help with, close to where I live — so when an alert comes, I actually read it.",
  },
  {
    role: 'Hospital coordinator',
    portrait: '/images/testimonials/portrait-coordinator.jpg',
    quote:
      'We post the type, units and deadline, then see who has accepted. Nothing counts as donated until we confirm it ourselves.',
  },
]

function CtaHeart() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 sm:h-28 sm:w-28" aria-hidden>
      <path
        d="M60 38 C52 22, 26 20, 20 42 C15 62, 36 80, 60 100 C84 80, 105 62, 100 42 C94 20, 68 22, 60 38 Z"
        fill="#F9D9DC"
        stroke="#D32F3C"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M60 10 V38" stroke="#D32F3C" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 58 v18 M51 67 h18" stroke="#D32F3C" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}
