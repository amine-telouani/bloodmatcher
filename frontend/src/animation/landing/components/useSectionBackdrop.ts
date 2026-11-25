import { useLayoutEffect, useRef } from 'react'
import { transform, useScroll, useTransform, type MotionValue } from 'framer-motion'

import { SECTION_TONES, type SectionTone } from '../../shared/tokens'

/**
 * Crossfades the page background between cream, blush and pink as each `[data-tone]` section
 * scrolls in. Driven purely by scroll position; re-measured on resize so it never drifts.
 */
export function useSectionBackdrop(rootRef: React.RefObject<HTMLElement>): MotionValue<string> {
  const { scrollY } = useScroll()
  const stops = useRef<{ input: number[]; output: string[] }>({
    input: [0, 1],
    output: [SECTION_TONES.cream, SECTION_TONES.cream],
  })

  const bg = useTransform(scrollY, (y) => transform(y, stops.current.input, stops.current.output) as string)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const measure = () => {
      const vh = window.innerHeight
      const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-tone]'))
      const input: number[] = []
      const output: string[] = []
      let prev: string | null = null

      for (const el of sections) {
        const color = SECTION_TONES[(el.dataset.tone as SectionTone) ?? 'cream'] ?? SECTION_TONES.cream
        const top = el.getBoundingClientRect().top + window.scrollY
        if (prev === null) {
          input.push(0)
          output.push(color)
        } else if (color !== prev) {
          // fade while the section's top travels from 80% to 35% of the viewport
          const start = Math.max(top - vh * 0.8, input[input.length - 1] + 1)
          const end = Math.max(top - vh * 0.35, start + 1)
          input.push(start, end)
          output.push(prev, color)
        }
        prev = color
      }
      if (input.length < 2) {
        input.push(1)
        output.push(output[0] ?? SECTION_TONES.cream)
      }
      stops.current = { input, output }
      bg.set(transform(window.scrollY, input, output) as string)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [rootRef, bg])

  return bg
}
