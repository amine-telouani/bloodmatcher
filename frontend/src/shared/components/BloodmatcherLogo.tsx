import React from 'react'

/** Bloodmatcher brand palette. */
export const BRAND = {
  red: '#E3263B',
  crimson: '#A8142B',
  deep: '#4A0B16',
  pink: '#FFC9D0',
  blush: '#F7828F',
  ink: '#22161A',
  cream: '#FFF5F3',
  night: '#1C1013',
}

type MarkProps = {
  size?: number
  /** 'full' has the face and hug; 'simple' is drop + heart for 32px and below. */
  detail?: 'full' | 'simple'
  /** On dark backgrounds the heart and face stay the same; only the outline guard changes. */
  title?: string
  className?: string
}

const DROP = 'M33 3.5C30.4 13.6 12 27 12 41.2a20 20 0 0 0 40 0C52 27.6 37.2 16.4 33 3.5Z'
const HEART =
  'M32 56.5C26 52.6 20.8 48.6 20.8 44.2c0-3.2 2.4-5.4 5.3-5.4 2.4 0 4.4 1.3 5.9 3.4 1.5-2.1 3.5-3.4 5.9-3.4 2.9 0 5.3 2.2 5.3 5.4 0 4.4-5.2 8.4-11.2 12.3Z'
const HEART_SIMPLE =
  'M32 55C24.6 50.4 18.8 45.8 18.8 40.6c0-3.8 2.9-6.4 6.3-6.4 2.9 0 5.2 1.6 6.9 4 1.7-2.4 4-4 6.9-4 3.4 0 6.3 2.6 6.3 6.4 0 5.2-5.8 9.8-13.2 14.4Z'

export function LogoMark({ size = 64, detail = 'full', title = 'Bloodmatcher', className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={title} className={className}>
      <path d={DROP} fill={BRAND.red} />
      {detail === 'simple' ? (
        <path d={HEART_SIMPLE} fill={BRAND.pink} />
      ) : (
        <>
          {/* face */}
          <ellipse cx="25.6" cy="30" rx="1.9" ry="2.4" fill={BRAND.deep} />
          <ellipse cx="38.4" cy="30" rx="1.9" ry="2.4" fill={BRAND.deep} />
          <path d="M28.6 34.2q3.4 2.6 6.8 0" fill="none" stroke={BRAND.deep} strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="21.8" cy="34" r="1.6" fill={BRAND.blush} />
          <circle cx="42.2" cy="34" r="1.6" fill={BRAND.blush} />
          {/* heart */}
          <path d={HEART} fill={BRAND.pink} />
          {/* hug: arms wrap from the body to the heart's sides */}
          <path d="M14.6 46.4c2.4 2 4.6 2.6 7 2" fill="none" stroke={BRAND.crimson} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M49.4 46.4c-2.4 2-4.6 2.6-7 2" fill="none" stroke={BRAND.crimson} strokeWidth="2.6" strokeLinecap="round" />
          <ellipse cx="22.4" cy="47.6" rx="2.5" ry="2.2" fill={BRAND.crimson} />
          <ellipse cx="41.6" cy="47.6" rx="2.5" ry="2.2" fill={BRAND.crimson} />
        </>
      )}
    </svg>
  )
}

type WordmarkProps = { tone?: 'light' | 'dark'; size?: number; className?: string }

/** "Blood" in brand red, "matcher" in ink (or white on dark). */
export function Wordmark({ tone = 'light', size = 28, className }: WordmarkProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '-0.035em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        color: tone === 'dark' ? '#FFFFFF' : BRAND.ink,
      }}
    >
      <span style={{ color: tone === 'dark' ? '#FF5468' : BRAND.red }}>Blood</span>matcher
    </span>
  )
}

type LogoProps = {
  tone?: 'light' | 'dark'
  layout?: 'horizontal' | 'stacked'
  /** Height of the mark in px; the wordmark scales with it. */
  size?: number
  className?: string
}

export function Logo({ tone = 'light', layout = 'horizontal', size = 40, className }: LogoProps) {
  const detail = size <= 32 ? 'simple' : 'full'
  if (layout === 'stacked') {
    return (
      <span className={className} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.18 }}>
        <LogoMark size={size} detail={detail} title="" />
        <Wordmark tone={tone} size={size * 0.42} />
      </span>
    )
  }
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.16 }} aria-label="Bloodmatcher">
      <LogoMark size={size} detail={detail} title="" />
      <Wordmark tone={tone} size={size * 0.6} />
    </span>
  )
}

type AppIconProps = { size?: number; tone?: 'light' | 'dark' | 'red' }

/** Rounded-square app icon. iOS-style corner radius (22.5%). */
export function AppIcon({ size = 120, tone = 'light' }: AppIconProps) {
  const bg = tone === 'dark' ? BRAND.night : tone === 'red' ? BRAND.red : BRAND.cream
  const detail = size <= 40 ? 'simple' : 'full'
  return (
    <span
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: size,
        height: size,
        borderRadius: size * 0.225,
        background: bg,
        boxShadow: tone === 'light' ? 'inset 0 0 0 1px rgba(34,22,26,0.08)' : undefined,
      }}
    >
      {tone === 'red' ? <ReversedMark size={size * 0.72} detail={detail} /> : <LogoMark size={size * 0.72} detail={detail} title="" />}
    </span>
  )
}

/** Mark for red backgrounds: white drop, red heart. */
function ReversedMark({ size, detail }: { size: number; detail: 'full' | 'simple' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d={DROP} fill="#FFFFFF" />
      {detail === 'simple' ? (
        <path d={HEART_SIMPLE} fill={BRAND.red} />
      ) : (
        <>
          <ellipse cx="25.6" cy="30" rx="1.9" ry="2.4" fill={BRAND.deep} />
          <ellipse cx="38.4" cy="30" rx="1.9" ry="2.4" fill={BRAND.deep} />
          <path d="M28.6 34.2q3.4 2.6 6.8 0" fill="none" stroke={BRAND.deep} strokeWidth="1.7" strokeLinecap="round" />
          <path d={HEART} fill={BRAND.red} />
          <path d="M14.6 46.4c2.4 2 4.6 2.6 7 2" fill="none" stroke={BRAND.crimson} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M49.4 46.4c-2.4 2-4.6 2.6-7 2" fill="none" stroke={BRAND.crimson} strokeWidth="2.6" strokeLinecap="round" />
          <ellipse cx="22.4" cy="47.6" rx="2.5" ry="2.2" fill={BRAND.crimson} />
          <ellipse cx="41.6" cy="47.6" rx="2.5" ry="2.2" fill={BRAND.crimson} />
        </>
      )}
    </svg>
  )
}
