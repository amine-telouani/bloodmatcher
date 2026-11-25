/** Mirrors the @theme block in the prototype's index.css, for SVG attributes and JS colour mixing. */
export const COLORS = {
  cream: '#FDF0ED',
  pink: '#F8C3CC',
  blush: '#F9D9DC',
  red: '#EE4450',
  redDark: '#D32F3C',
  redDeep: '#B42532',
  ink: '#262222',
  inkSoft: '#4A3F40',
  muted: '#6B5F60',
  paper: '#FFF9F7',
} as const

export type SectionTone = 'cream' | 'blush' | 'pink'

export const SECTION_TONES: Record<SectionTone, string> = {
  cream: COLORS.cream,
  blush: COLORS.blush,
  pink: COLORS.pink,
}

/** Strong ease-out used for every entrance. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const

/** Section reveal timing: 450–650ms, 12–20px travel, slight stagger. */
export const REVEAL = { duration: 0.55, travel: 16, stagger: 0.07 } as const
