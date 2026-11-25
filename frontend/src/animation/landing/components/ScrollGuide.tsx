import { motion, useSpring, useTransform, type MotionValue } from 'framer-motion'

import { COLORS } from '../../shared/tokens'

/** The scroll-driven tube and droplet fit inside the hero's bottom padding. */
export function ScrollGuide({ progress }: { progress: MotionValue<number> }) {
  const p = useSpring(progress, { stiffness: 140, damping: 30, mass: 0.5, restDelta: 0.0005 })
  const length = useTransform(p, [0.05, 0.65], [0, 1])
  const lineOpacity = useTransform(p, [0.02, 0.12, 0.9, 1], [0, 1, 1, 0.5])
  const dropOpacity = useTransform(p, [0.62, 0.77], [0, 1])
  const dropY = useTransform(p, [0.62, 0.8], [-6, 0])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-2 z-0 mx-auto max-w-6xl px-8">
      <svg viewBox="0 0 1152 142" className="block h-auto w-full">
        <motion.path
          d="M842 8 C842 67 545 59 470 78 S412 91 392 99"
          fill="none"
          stroke={COLORS.red}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength: length, opacity: lineOpacity }}
        />
        <g transform="translate(392 120)">
          <motion.path
            d="M0 -10 C4 -5 8 0 8 4 A8 8 0 0 1 -8 4 C-8 0 -4 -5 0 -10 Z"
            fill={COLORS.red}
            style={{ opacity: dropOpacity, y: dropY }}
          />
        </g>
      </svg>
    </div>
  )
}
