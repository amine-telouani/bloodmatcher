import { useEffect, useId, useRef, type PointerEvent } from 'react'
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'

import { COLORS } from '../tokens'
import type { Urgency } from '../../../shared/bloodmatcher/lib/blood'

type Props = {
  urgency: Urgency
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  emphasize?: boolean
  className?: string
}

const ENVELOPE = 'M13 12 H35 Q42 12 42 20 V48 Q42 56 34 57 H14 Q6 56 6 48 V20 Q6 12 13 12 Z'
const CHAMBER = 'M13 14 H35 Q40.5 14 40.5 20 V48 Q40.5 54.8 34 55 H14 Q7.5 54.8 7.5 48 V20 Q7.5 14 13 14 Z'
const EMPTY_SURFACE = 59
const SIZES = { sm: 'w-8', md: 'w-11', lg: 'w-16' }
const MAX_POINTER_TILT = { sm: 1.6, md: 2.1, lg: 2.7 }

// Keep the two crests in opposite phases so the liquid rocks, then settles.
function surface(y: number, tilt: number, ripple: number) {
  return `M3 ${y + tilt} C12 ${y + tilt - ripple} 16 ${y - ripple} 24 ${y} C32 ${y + ripple} 36 ${y - tilt + ripple} 45 ${y - tilt}`
}

function liquid(y: number, tilt: number, ripple: number) {
  return `${surface(y, tilt, ripple)} V61 H3 Z`
}

const STYLE = {
  NORMAL: { label: 'Normal', surfaceY: 24, duration: 1.4, tint: '#fff5f1', stroke: '#765858', chip: 'bg-paper text-ink ring-1 ring-ink/25' },
  URGENT: { label: 'Urgent', surfaceY: 42, duration: 1.15, tint: '#fff0ee', stroke: COLORS.redDark, chip: 'bg-blush text-red-deep ring-1 ring-red-dark/50' },
  CRITICAL: { label: 'Critical', surfaceY: 51.5, duration: 0.95, tint: '#fce2e3', stroke: COLORS.redDeep, chip: 'bg-red-deep text-white' },
} satisfies Record<Urgency, { label: string; surfaceY: number; duration: number; tint: string; stroke: string; chip: string }>

/** The liquid level encodes urgency, with the lowest fill for a critical request. */
export function UrgencyBloodBag({ urgency, size = 'md', showLabel = true, emphasize = false, className = '' }: Props) {
  const id = useId()
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.55 })
  const reducedMotion = useReducedMotion()
  const style = STYLE[urgency]
  const level = style.surfaceY
  const delay = size === 'sm' ? 0 : 0.07
  const duration = style.duration * (size === 'sm' ? 0.8 : 1)
  const height = useMotionValue(reducedMotion ? level : EMPTY_SURFACE)
  const slosh = useMotionValue(0)
  const pointerTilt = useSpring(0, { stiffness: 145, damping: 19, mass: 0.8 })
  const pointerRipple = useSpring(0, { stiffness: 95, damping: 17, mass: 0.85 })
  const front = useTransform(() => liquid(
    height.get(),
    slosh.get() + pointerTilt.get(),
    0.45 + slosh.get() * 1.2 + pointerRipple.get(),
  ))
  const back = useTransform(() => liquid(
    height.get() - 0.7,
    -slosh.get() * 0.9 + pointerTilt.get() * 0.74,
    -0.45 - slosh.get() * 1.3 - pointerRipple.get(),
  ))

  function followPointer(event: PointerEvent<HTMLSpanElement>) {
    if (event.pointerType !== 'mouse' || reducedMotion || !inView) return
    const { left, top, width, height: boundsHeight } = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - left) / width * 2 - 1
    const y = (event.clientY - top) / boundsHeight * 2 - 1
    const maxTilt = urgency === 'CRITICAL' ? 1.4 : MAX_POINTER_TILT[size]
    pointerTilt.set(Math.max(-1, Math.min(1, x)) * maxTilt)
    pointerRipple.set(Math.max(-1, Math.min(1, y)) * 0.9)
  }

  function settlePointer() {
    pointerTilt.set(0)
    pointerRipple.set(0)
  }

  useEffect(() => {
    if (reducedMotion) {
      height.set(level)
      slosh.set(0)
      return
    }
    if (!inView) return

    const rise = animate(height, [height.get(), level - 1.4, level + 0.55, level - 0.15, level], {
      duration, delay, times: [0, 0.56, 0.76, 0.9, 1],
      ease: [[0.31, 0.05, 0.22, 1], 'easeInOut', 'easeInOut', 'easeOut'],
    })
    const wave = animate(slosh, [slosh.get(), 2.8, -1.45, 0.6, 0], {
      duration, delay, times: [0, 0.5, 0.72, 0.88, 1], ease: 'easeInOut',
    })
    return () => { rise.stop(); wave.stop() }
  }, [delay, duration, height, inView, level, reducedMotion, slosh])

  return (
    <span
      className={`inline-flex flex-col items-center gap-1.5 ${className}`}
      onPointerMove={followPointer}
      onPointerLeave={settlePointer}
      onPointerCancel={settlePointer}
    >
      <svg ref={ref} viewBox="0 0 48 70" className={`${SIZES[size]} shrink-0`} role={showLabel ? undefined : 'img'} aria-label={showLabel ? undefined : `${style.label} urgency`} aria-hidden={showLabel || undefined} focusable="false" data-urgency-bag={urgency}>
        <defs>
          <clipPath id={`${id}-chamber`}><path d={CHAMBER} /></clipPath>
          <linearGradient id={`${id}-shell`} x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#fffdfb" />
            <stop offset="1" stopColor={style.tint} />
          </linearGradient>
          <linearGradient id={`${id}-liquid`} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#f66f78" />
            <stop offset="0.22" stopColor="#dd3549" />
            <stop offset="1" stopColor="#9d1932" />
          </linearGradient>
        </defs>

        <path d="M18.5 12 V8.5 Q18.5 4.5 22.5 4.5 H25.5 Q29.5 4.5 29.5 8.5 V12" fill="none" stroke={style.stroke} strokeWidth="1.7" strokeLinecap="round" />
        <path d={ENVELOPE} fill={`url(#${id}-shell)`} />
        <g clipPath={`url(#${id}-chamber)`}>
          <motion.path data-liquid="back" fill="#eb5b68" d={reducedMotion ? liquid(level - 0.7, 0, -0.45) : back} />
          <motion.path data-liquid="front" fill={`url(#${id}-liquid)`} d={reducedMotion ? liquid(level, 0, 0.45) : front} />
          <path d="M11 21 V44 Q11 50 15 51" stroke="white" strokeOpacity="0.5" strokeWidth="1.35" strokeLinecap="round" fill="none" />
          <path d="M37 23 V46" stroke="white" strokeOpacity="0.23" strokeWidth="1" strokeLinecap="round" />
        </g>
        <path d={ENVELOPE} fill="none" stroke={style.stroke} strokeWidth={emphasize ? 2.2 : 1.75} strokeLinejoin="round" />
        <path d="M20 57 H28 V61 Q28 63 26 63 H22 Q20 63 20 61 Z M24 63 V67" fill={style.tint} stroke={style.stroke} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        {urgency === 'URGENT' && (
          <g fill="none" stroke={style.stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="29" r="6.5" />
            <path d="M24 25.5 V29 L26.5 30.5" />
          </g>
        )}
        {urgency === 'CRITICAL' && <path d="M24 23 V33 M24 38 V38.4" fill="none" stroke={style.stroke} strokeWidth="2.8" strokeLinecap="round" />}
      </svg>
      {showLabel && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold leading-tight ${style.chip}`}>{style.label}</span>}
    </span>
  )
}
