import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { COLORS, EASE_OUT } from '../../shared/tokens'

/**
 * Explanatory diagram of the widening search: 5 → 15 → 30 → 60 km.
 * Rings draw once, inside-out, when the diagram enters the view. Not to scale.
 */
export function RadiusDiagram() {
  const reduced = useReducedMotion()
  const ring = (i: number) =>
    reduced
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true, amount: 0.5 },
          transition: { pathLength: { duration: 0.6, ease: EASE_OUT, delay: 0.15 + i * 0.16 }, opacity: { duration: 0.2, delay: 0.15 + i * 0.16 } },
        }
  const appear = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true, amount: 0.5 },
          transition: { duration: 0.4, ease: EASE_OUT, delay },
        }

  return (
    <svg
      viewBox="0 0 400 400"
      className="h-auto w-full"
      role="img"
      aria-label="Search radius diagram: the hospital sits at the centre; alerts start within 5 kilometres and widen to 15, 30 and then 60 kilometres."
    >
      <circle cx="200" cy="200" r="186" fill={COLORS.paper} />
      {RINGS.map((r, i) => (
        <motion.circle
          key={r.km}
          cx="200"
          cy="200"
          r={r.r}
          fill="none"
          stroke={i === 0 ? COLORS.redDark : COLORS.ink}
          strokeOpacity={i === 0 ? 1 : 0.55 - i * 0.08}
          strokeWidth={i === 0 ? 2.5 : 1.6}
          strokeDasharray={i === 0 ? undefined : '4 6'}
          {...ring(i)}
        />
      ))}

      {/* donors — outlined = not compatible / not available, filled red = compatible & available */}
      {DONORS.map((d, i) => (
        <motion.circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.match ? 6 : 5}
          fill={d.match ? COLORS.red : COLORS.paper}
          stroke={d.match ? COLORS.redDeep : COLORS.muted}
          strokeWidth="1.6"
          {...appear(0.3 + d.ring * 0.16)}
        />
      ))}

      {/* hospital */}
      <rect x="182" y="182" width="36" height="36" rx="10" fill={COLORS.ink} />
      <path d="M200 191 v18 M191 200 h18" stroke={COLORS.paper} strokeWidth="4" strokeLinecap="round" />

      {/* ring labels */}
      {RINGS.map((r, i) => (
        <motion.g key={r.km} {...appear(0.25 + i * 0.16)}>
          <rect x={200 - 26} y={200 - r.r - 12} width="52" height="24" rx="12" fill={COLORS.paper} stroke={COLORS.ink} strokeOpacity="0.25" />
          <text
            x="200"
            y={200 - r.r + 5}
            textAnchor="middle"
            fontFamily="DM Sans, sans-serif"
            fontSize="14"
            fontWeight="600"
            fill={COLORS.ink}
          >
            {r.km} km
          </text>
        </motion.g>
      ))}
    </svg>
  )
}

const RINGS = [
  { km: 5, r: 48 },
  { km: 15, r: 92 },
  { km: 30, r: 136 },
  { km: 60, r: 176 },
]

const DONORS = [
  { x: 232, y: 214, match: true, ring: 0 },
  { x: 176, y: 230, match: false, ring: 0 },
  { x: 270, y: 260, match: true, ring: 1 },
  { x: 122, y: 168, match: false, ring: 1 },
  { x: 150, y: 270, match: true, ring: 1 },
  { x: 312, y: 150, match: false, ring: 2 },
  { x: 92, y: 250, match: true, ring: 2 },
  { x: 258, y: 330, match: false, ring: 2 },
  { x: 350, y: 236, match: true, ring: 3 },
  { x: 64, y: 140, match: false, ring: 3 },
  { x: 180, y: 364, match: false, ring: 3 },
]
