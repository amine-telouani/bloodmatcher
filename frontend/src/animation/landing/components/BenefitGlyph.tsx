import { useId, type RefObject } from 'react'
import { motion, type MotionValue } from 'framer-motion'

import { COLORS } from '../../shared/tokens'

const MATCHING_DROP = 'M22 16 C 28 24, 31 29, 31 34 A9 9 0 0 1 13 34 C 13 29, 16 24, 22 16 Z'

/** Small hand-drawn-style line glyphs, matching the hero's stroke language. */
export function BenefitGlyph({ kind, dropRef, dropFillTop }: {
  kind: 'compatible' | 'local' | 'control'
  dropRef?: RefObject<SVGPathElement>
  dropFillTop?: MotionValue<number>
}) {
  const clipId = useId()
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-14 w-14 sm:h-16 sm:w-16"
      fill="none"
      stroke={COLORS.ink}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="32" cy="32" r="30" fill={COLORS.paper} stroke="none" />
      {kind === 'compatible' && (
        <>
          {dropFillTop && (
            <>
              <defs><clipPath id={clipId}><path d={MATCHING_DROP} stroke="none" /></clipPath></defs>
              <motion.rect data-drop-fill x="12" y={dropFillTop} width="20" height="29" fill={COLORS.red} stroke="none" clipPath={`url(#${clipId})`} />
            </>
          )}
          <path ref={dropRef} data-matching-drop d={MATCHING_DROP} fill={dropFillTop ? 'none' : COLORS.red} />
          <path d="M42 22 C 47 29, 50 33, 50 37 A8 8 0 0 1 34 37 C 34 33, 37 29, 42 22 Z" />
          <path d="M24 49 C 30 53, 36 53, 42 49" stroke={COLORS.redDark} />
        </>
      )}
      {kind === 'local' && (
        <>
          <circle cx="32" cy="36" r="18" strokeDasharray="3 4" />
          <circle cx="32" cy="36" r="9" />
          <path d="M32 14 C 26 14, 23 18, 23 22 C 23 28, 32 36, 32 36 C 32 36, 41 28, 41 22 C 41 18, 38 14, 32 14 Z" fill={COLORS.red} stroke="none" />
          <circle cx="32" cy="22" r="3" fill={COLORS.paper} stroke="none" />
        </>
      )}
      {kind === 'control' && (
        <>
          <rect x="14" y="24" width="36" height="18" rx="9" />
          <circle cx="41" cy="33" r="6" fill={COLORS.red} stroke="none" />
          <path d="M20 50 C 26 47, 34 47, 40 50" stroke={COLORS.redDark} />
          <path d="M28 14 C 30 11, 34 11, 36 14" />
        </>
      )}
    </svg>
  )
}
