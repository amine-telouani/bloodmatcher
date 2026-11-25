import React, { useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'

import { EASE_OUT } from '../../shared/tokens'

export function FaqList() {
  const [open, setOpen] = useState<number | null>(0)
  const baseId = useId()
  const reduced = useReducedMotion()

  return (
    <ul className="divide-y divide-ink/15 border-y border-ink/15">
      {FAQS.map((f, i) => {
        const isOpen = open === i
        const panelId = `${baseId}-panel-${i}`
        const buttonId = `${baseId}-button-${i}`
        return (
          <li key={f.q}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-xl font-semibold sm:text-[22px]"
              >
                <span>{f.q}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-ink/25">
                  <Plus
                    className={`h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'rotate-45' : ''}`}
                    aria-hidden
                  />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.24, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 pr-12 leading-relaxed text-ink-soft">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}

const FAQS = [
  {
    q: 'How does matching work?',
    a: "Every request names a blood type. You're alerted only if your type is compatible, you've marked yourself available, and you're within the current search area — which starts at 5 km from the hospital and widens to 15, 30 and then 60 km.",
  },
  {
    q: "What if I can't donate right now?",
    a: "Switch yourself to unavailable in your profile and alerts pause until you switch back. If an alert does reach you, you can simply decline it — there's no penalty.",
  },
  {
    q: 'Why is there a 90-day wait between donations?',
    a: "BloodMatcher waits 90 days after your last recorded donation before treating you as ready again, and shows the date your next window opens. It's the app's rule, not a medical check — staff confirm eligibility when you donate.",
  },
  {
    q: 'Does accepting a request mean I\u2019ve donated?',
    a: "No. Accepting tells the hospital you intend to come in. The donation only counts once hospital staff confirm it was completed — that's the date your waiting period counts from.",
  },
]
