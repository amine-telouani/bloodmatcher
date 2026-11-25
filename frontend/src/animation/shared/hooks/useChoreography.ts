import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * How much scroll choreography to run.
 * - 'full'   : desktop/tablet, motion allowed — all decorative scroll movement.
 * - 'simple' : narrow screens — fades only, no travel, normal flow.
 * - 'off'    : prefers-reduced-motion — no scroll-driven movement or repeating effects.
 */
export type ChoreographyMode = 'full' | 'simple' | 'off'

export function useChoreography(): { mode: ChoreographyMode; reduced: boolean } {
  const reduced = useReducedMotion() ?? false
  const wide = useMediaQuery('(min-width: 768px)')
  return { mode: reduced ? 'off' : wide ? 'full' : 'simple', reduced }
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia(query).matches
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}
