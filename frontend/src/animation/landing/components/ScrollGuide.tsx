import { useEffect, useState, type RefObject } from 'react'
import { motion, useTransform, type MotionValue } from 'framer-motion'

import { COLORS } from '../../shared/tokens'

type Props = {
  progress: MotionValue<number>
  main: RefObject<HTMLElement>
  hero: RefObject<HTMLElement>
  artwork: RefObject<HTMLDivElement>
  target: RefObject<SVGPathElement>
}

export const GUIDE_ARRIVAL = 0.7

/** Draw across the section boundary to the tip of the left drop. */
export function ScrollGuide({ progress, main, hero, artwork, target }: Props) {
  const [route, setRoute] = useState({ path: '', height: 0 })
  const draw = useTransform(progress, [0.12, GUIDE_ARRIVAL], [0, 1])
  const opacity = useTransform(progress, [0.12, 0.24], [0, 0.9])

  useEffect(() => {
    if (!main.current || !hero.current || !artwork.current || !target.current) return
    const measure = () => {
      if (!main.current || !hero.current || !artwork.current || !target.current) return
      const origin = main.current.getBoundingClientRect()
      const heroBox = hero.current.getBoundingClientRect()
      const art = artwork.current.getBoundingClientRect()
      const icon = target.current.getBoundingClientRect()
      const x = art.left + art.width / 2 - origin.left
      const y = heroBox.bottom - origin.top - 92
      const endX = icon.left + icon.width / 2 - origin.left
      const endY = icon.top - origin.top
      const bendY = heroBox.bottom - origin.top + 18
      const path = `M ${x} ${y} C ${x} ${bendY}, ${endX} ${bendY - 20}, ${endX} ${bendY + 44} L ${endX} ${endY}`
      const height = Math.ceil(Math.max(y, endY) + 20)
      setRoute(previous => previous.path === path && previous.height === height ? previous : { path, height })
    }
    const observer = new ResizeObserver(measure)
    for (const element of [main.current, hero.current, artwork.current, target.current.ownerSVGElement]) {
      if (element) observer.observe(element)
    }
    window.addEventListener('resize', measure)
    measure()
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [artwork, hero, main, target])

  return route.path && (
    <svg aria-hidden data-scroll-guide className="pointer-events-none absolute inset-x-0 top-0 z-10 block w-full" height={route.height}>
      <motion.path data-guide-line d={route.path} fill="none" stroke={COLORS.red} strokeWidth="2.25" strokeLinecap="round" style={{ pathLength: draw, opacity }} />
    </svg>
  )
}
