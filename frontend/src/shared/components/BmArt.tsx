import React from 'react'

/** Outline heart scattered around the auth pages (hidden on phones). */
export function Heart({ className }: { className: string }) {
  return (
    <svg className={className} width="18" height="16" viewBox="0 0 18 16" aria-hidden="true">
      <path
        d="M9 14.5S1.5 10 1.5 5.2A3.7 3.7 0 0 1 9 3.6a3.7 3.7 0 0 1 7.5 1.6C16.5 10 9 14.5 9 14.5Z"
        fill="none"
        stroke="var(--bm-ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** The hanging blood bag on the right of the auth pages (desktop only). */
export function BloodBag() {
  return (
    <svg className="bm-bag" viewBox="0 0 200 330" aria-hidden="true">
      {/* tube from the nav down to the bag */}
      <path d="M118 0 V40" stroke="var(--bm-ink)" strokeWidth="2" fill="none" />
      {/* hanger */}
      <rect x="86" y="40" width="28" height="34" rx="4" fill="none" stroke="var(--bm-ink)" strokeWidth="2" />
      <rect x="72" y="66" width="10" height="26" rx="3" fill="var(--bm-cream)" stroke="var(--bm-ink)" strokeWidth="2" />
      <rect x="118" y="66" width="10" height="26" rx="3" fill="var(--bm-cream)" stroke="var(--bm-ink)" strokeWidth="2" />
      {/* bag */}
      <path
        d="M40 96 Q40 86 52 86 H148 Q160 86 160 96 V250 Q160 278 132 278 H68 Q40 278 40 250 Z"
        fill="var(--bm-cream)"
        stroke="var(--bm-ink)"
        strokeWidth="2"
      />
      <path d="M46 104 H154 V248 Q154 272 130 272 H70 Q46 272 46 248 Z" fill="var(--bm-red)" />
      {/* label */}
      <rect x="66" y="150" width="68" height="62" rx="3" fill="#fff" stroke="var(--bm-ink)" strokeWidth="2" />
      <path d="M76 162 h10 M81 157 v10" stroke="var(--bm-red)" strokeWidth="4" />
      <path d="M94 160 h30 M94 166 h30 M76 180 h20 M76 186 h20 M76 192 h20" stroke="var(--bm-ink)" strokeWidth="1.6" />
      <text x="104" y="204" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="26" fill="var(--bm-ink)">A</text>
      {/* outlet + tube down and away */}
      <rect x="92" y="278" width="16" height="14" fill="var(--bm-cream)" stroke="var(--bm-ink)" strokeWidth="2" />
      <path d="M100 292 V330" stroke="var(--bm-red)" strokeWidth="2.5" fill="none" />
    </svg>
  )
}
