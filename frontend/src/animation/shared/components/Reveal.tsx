import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { EASE_OUT, REVEAL } from '../tokens'

/** One-time section entrance: fade + 16px rise, 550ms. Content is always rendered; nothing shifts layout. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: REVEAL.travel }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: REVEAL.duration, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}
