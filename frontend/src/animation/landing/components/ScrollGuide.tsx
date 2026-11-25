import React from 'react'
import { motion, useSpring, useTransform, type MotionValue } from 'framer-motion'

import { COLORS } from '../../shared/tokens'

/**
 * The tube line that leaves the hero illustration and leads the eye down into "Why it matters".
 * Drawn by scroll position only — it never animates on its own. Desktop/tablet with motion allowed.
 */
export function ScrollGuide({ progress }: { progress: MotionValue<number> }) {
  const p = useSpring(progress, { stiffness: 140, damping: 30, mass: 0.5, restDelta: 0.0005 })
  const length = useTransform(p, [0.05, 0.65], [0, 1])
  const lineOpacity = useTransform(p, [0.02, 0.12, 0.9, 1], [0, 1, 1, 0.5])
  const dropOpacity = useTransform(p, [0.55, 0.7], [0, 1])
  const dropY = useTransform(p, [0.55, 0.75], [-14, 0])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 overflow-hidden z-0 mx-auto max-w-6xl px-8">
      <svg viewBox="0 0 1152 220" className="h-auto w-full overflow-visible">
        <motion.path
          d="M842 0 C 842 110, 540 70, 470 150 S 420 205, 392 214"
          fill="none"
          stroke={COLORS.red}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength: length, opacity: lineOpacity }}
        />
        <motion.path
          d="M0 -12 C 6 -4, 8.5 0, 8.5 4.5 A8.5 8.5 0 0 1 -8.5 4.5 C -8.5 0, -6 -4, 0 -12 Z"
          transform="translate(380 214)"
          fill={COLORS.red}
          style={{ opacity: dropOpacity, y: dropY }}
        />
      </svg>
    </div>
  )
}
