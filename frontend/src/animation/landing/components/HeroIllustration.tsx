import React from 'react'
import { motion, useSpring, useTransform, type MotionValue } from 'framer-motion'

import type { ChoreographyMode } from '../../shared/hooks/useChoreography'
import { COLORS, EASE_OUT } from '../../shared/tokens'

type Props = {
  /** 0 while the hero fills the view → 1 once it has scrolled away. */
  progress: MotionValue<number>
  mode: ChoreographyMode
}

/**
 * Original line-art composition: blood bag → tube → heart, two reaching hands, small hearts and droplets.
 * Each group is separate so scrolling can move it on its own. Text never moves with it.
 */
export function HeroIllustration({ progress, mode }: Props) {
  const p = useSpring(progress, { stiffness: 140, damping: 30, mass: 0.5, restDelta: 0.0005 })
  const full = mode === 'full'
  const draw = mode !== 'off'

  // small hearts fade and shrink first
  const heartsOpacity = useTransform(p, [0, 0.6], [1, 0])
  const heartsScale = useTransform(p, [0, 0.6], [1, 0.82])
  // the main heart + bag settles back a little
  const mainScale = useTransform(p, [0, 1], [1, 0.94])
  const mainOpacity = useTransform(p, [0, 1], [1, 0.6])
  // hands part toward the edges and bottom
  const leftX = useTransform(p, [0, 1], [0, -64])
  const rightX = useTransform(p, [0, 1], [0, 64])
  const handsY = useTransform(p, [0, 1], [0, 76])
  const handsOpacity = useTransform(p, [0.15, 1], [1, 0])
  // droplets fall away
  const dropsY = useTransform(p, [0, 1], [0, 92])
  const dropsOpacity = useTransform(p, [0.1, 0.75], [1, 0])

  const strokeIn = (delay: number) =>
    draw
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { pathLength: { duration: 0.65, ease: EASE_OUT, delay }, opacity: { duration: 0.2, delay } },
        }
      : {}

  const fadeIn = (delay: number) =>
    draw
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.45, ease: EASE_OUT, delay },
        }
      : {}

  return (
    <svg viewBox="0 0 520 744" data-hero-art="true" className="h-auto w-full overflow-visible" aria-hidden focusable="false">
      {/* ── Small hearts ── */}
      <motion.g style={full || mode === 'simple' ? { opacity: heartsOpacity, scale: full ? heartsScale : 1 } : undefined}>
        {SMALL_HEARTS.map((h, i) => (
          <motion.path
            key={i}
            d={SMALL_HEART}
            transform={`translate(${h.x} ${h.y}) scale(${h.s})`}
            fill={h.filled ? COLORS.pink : 'none'}
            stroke={COLORS.red}
            strokeWidth={2 / h.s}
            strokeLinejoin="round"
            {...fadeIn(0.55 + i * 0.05)}
          />
        ))}
      </motion.g>

      {/* ── Main: bag, tube and heart ── */}
      <motion.g style={full ? { scale: mainScale, opacity: mainOpacity, originX: '50%', originY: '40%' } : undefined}>
        {/* bag */}
        <motion.path d="M244 28 V14 a6 6 0 0 1 6 -6 h20 a6 6 0 0 1 6 6 V28" fill="none" stroke={COLORS.ink} strokeWidth="2.5" strokeLinecap="round" {...strokeIn(0)} />
        <motion.g {...fadeIn(0.1)}>
          <rect x="214" y="28" width="92" height="112" rx="22" fill={COLORS.paper} />
          <clipPath id="hero-bag-clip">
            <rect x="214" y="28" width="92" height="112" rx="22" />
          </clipPath>
          <path clipPath="url(#hero-bag-clip)" d="M210 74 q 25 -9 50 0 t 50 0 V146 H210 Z" fill={COLORS.red} />
          <path d="M260 88 v22 M249 99 h22" stroke={COLORS.paper} strokeWidth="5" strokeLinecap="round" />
        </motion.g>
        <motion.rect x="214" y="28" width="92" height="112" rx="22" fill="none" stroke={COLORS.ink} strokeWidth="2.5" {...strokeIn(0.05)} />
        <rect x="251" y="140" width="18" height="14" rx="4" fill={COLORS.paper} stroke={COLORS.ink} strokeWidth="2.5" />

        {/* tube down into the heart */}
        <motion.path d="M260 154 V214" stroke={COLORS.red} strokeWidth="14" strokeLinecap="round" fill="none" {...strokeIn(0.15)} />
        <motion.path d="M260 154 V214" stroke={COLORS.cream} strokeWidth="6" strokeLinecap="round" fill="none" {...strokeIn(0.15)} />

        {/* heart made of tubing */}
        <motion.path d={BIG_HEART} fill={COLORS.blush} {...fadeIn(0.3)} />
        <motion.path d={BIG_HEART} fill="none" stroke={COLORS.red} strokeWidth="16" strokeLinejoin="round" {...strokeIn(0.25)} />
        <motion.path d={BIG_HEART} fill="none" stroke={COLORS.cream} strokeWidth="7" strokeLinejoin="round" {...strokeIn(0.25)} />
        <motion.text
          x="260"
          y="320"
          textAnchor="middle"
          fontFamily="Caveat, cursive"
          fontSize="30"
          fontWeight="600"
          fill={COLORS.redDeep}
          {...fadeIn(0.7)}
        >
          every drop counts
        </motion.text>
        <motion.path d="M250 343 c 6 4, 14 4, 20 0" fill="none" stroke={COLORS.redDeep} strokeWidth="2" strokeLinecap="round" {...strokeIn(0.8)} />

        {/* heart outlet + clip */}
        <motion.path d="M260 452 V496" stroke={COLORS.red} strokeWidth="14" strokeLinecap="round" fill="none" {...strokeIn(0.5)} />
        <motion.path d="M260 452 V496" stroke={COLORS.cream} strokeWidth="6" strokeLinecap="round" fill="none" {...strokeIn(0.5)} />
        <rect x="249" y="494" width="22" height="26" rx="5" fill={COLORS.paper} stroke={COLORS.ink} strokeWidth="2.5" />
      </motion.g>

      {/* ── Hands ── */}
      <motion.g style={full ? { x: leftX, y: handsY, opacity: handsOpacity } : undefined}>
        <g transform="translate(150 584) rotate(32) scale(1.25)">
          <Hand delay={0.35} draw={draw} />
        </g>
      </motion.g>
      <motion.g style={full ? { x: rightX, y: handsY, opacity: handsOpacity } : undefined}>
        <g transform="translate(370 584) scale(-1 1) rotate(32) scale(1.25)">
          <Hand delay={0.42} draw={draw} />
        </g>
      </motion.g>

      {/* ── Droplets ── */}
      <motion.g style={full ? { y: dropsY, opacity: dropsOpacity } : mode === 'simple' ? { opacity: dropsOpacity } : undefined}>
        {DROPS.map((d, i) => (
          <motion.path
            key={i}
            d={DROP}
            transform={`translate(${d.x} ${d.y}) scale(${d.s})`}
            fill={COLORS.red}
            {...fadeIn(0.65 + i * 0.06)}
          />
        ))}
      </motion.g>
    </svg>
  )
}

function Hand({ delay, draw }: { delay: number; draw: boolean }) {
  const anim = draw
    ? {
        initial: { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1 },
        transition: { pathLength: { duration: 0.65, ease: EASE_OUT, delay }, opacity: { duration: 0.2, delay } },
      }
    : {}
  return (
    <g fill="none" stroke={COLORS.ink} strokeWidth={2.2 / 1.25} strokeLinecap="round" strokeLinejoin="round">
      <path d={SLEEVE} fill={COLORS.pink} stroke="none" />
      <motion.path d={SLEEVE} {...anim} />
      <path d={HAND} fill={COLORS.paper} stroke="none" />
      <motion.path d={HAND} {...anim} />
      <motion.path d="M-12 -57 V-88 M-1 -57 V-98 M10 -59 V-85 M-12 -35 Q-1 -43 10 -37" strokeWidth={1.2} {...anim} />
    </g>
  )
}

const BIG_HEART =
  'M260 214 C 232 168, 140 150, 116 232 C 98 300, 168 372, 260 452 C 352 372, 422 300, 404 232 C 380 150, 288 168, 260 214 Z'

const HAND =
  'M-20 0 L-22 -30 C-24 -38 -34 -44 -41 -53 C-47 -61 -44 -68 -38 -68 C-34 -68 -31 -62 -24 -57 L-22 -55 V-88 C-22 -98 -12 -98 -12 -88 V-103 C-12 -113 -1 -113 -1 -103 V-98 C-1 -108 10 -108 10 -98 V-85 C10 -94 20 -94 20 -85 V-40 C20 -24 17 -12 18 0 Z'

const SLEEVE = 'M-26 2 Q-1 6 24 2 L26 30 Q0 37 -28 30 Z'

const SMALL_HEART = 'M0 6 C -2 -2, -12 -4, -12 4 C -12 10, -5 14, 0 18 C 5 14, 12 10, 12 4 C 12 -4, 2 -2, 0 6 Z'

const SMALL_HEARTS = [
  { x: 92, y: 118, s: 1.1, filled: false },
  { x: 438, y: 82, s: 0.85, filled: true },
  { x: 452, y: 300, s: 1.2, filled: false },
  { x: 58, y: 322, s: 0.9, filled: true },
  { x: 150, y: 40, s: 0.7, filled: false },
  { x: 470, y: 440, s: 0.75, filled: false },
]

const DROP = 'M0 -14 C 7 -5, 10 0, 10 5 A10 10 0 0 1 -10 5 C -10 0, -7 -5, 0 -14 Z'

const DROPS = [
  { x: 360, y: 186, s: 1 },
  { x: 166, y: 196, s: 0.75 },
  { x: 404, y: 492, s: 0.85 },
]
