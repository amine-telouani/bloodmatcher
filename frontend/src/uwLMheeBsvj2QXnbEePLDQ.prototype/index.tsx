import React, { useEffect, useState } from 'react'

import Home from '../1WUQztQZipTVEmugphuJqM.frame'
import SignIn from '../8xqE7k7wCsciXcaxWgwbsu.frame'
import Register from '../q3JT8iSzqzc9WuaNHhyM84.frame'
import DonorDashboard from '../vSum2cEi8fg5ASaUJEzvnn.frame'
import HospitalDashboard from '../j7228o8P61Z2CW1kNDAKoD.frame'
import Admin from '../j4rnZZWqnhMNALKdHZ8T8d.frame'
import NotFound from '../kDGeYDgpar9A2bHfAUa964.frame'

const HOME = '1WUQztQZipTVEmugphuJqM'

/** The size every frame draws at, unless one exports its own. */
export const viewport = 'web'

type Props = { start?: string }

export default function Prototype({ start }: Props) {
  const [path, setPath] = useState(() => (start ? idToPath[start] ?? '/' : new URLSearchParams(window.location.search).get('screen') ?? '/'))
  const go = (p: string) => {
    setPath(p.split('?')[0] ?? '/')
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('screen') !== '/design-preview') return
    url.searchParams.delete('screen')
    window.history.replaceState(window.history.state, '', url)
  }, [])

  if (/^\/alerts\/[^/]+/.test(path)) return <DonorDashboard onNavigate={go} />
  if (/^\/requests\/[^/]+\/escalation/.test(path)) return <HospitalDashboard onNavigate={go} />
  switch (path) {
    case '/':
    case '/design-preview':
    case '/states':
      return <Home onNavigate={go} />
    case '/login':
    case '/forgot-password':
    case '/reset-password':
      return <SignIn onNavigate={go} />
    case '/register':
      return <Register onNavigate={go} />
    case '/donor':
      return <DonorDashboard onNavigate={go} />
    case '/hospital':
      return <HospitalDashboard onNavigate={go} />
    case '/admin':
      return <Admin onNavigate={go} />
    default:
      return <NotFound onNavigate={go} />
  }
}

const idToPath: Record<string, string> = {
  [HOME]: '/',
  jk3wN8cxrz2hKKVkf6Tfve: '/design-preview',
  '8xqE7k7wCsciXcaxWgwbsu': '/login',
  q3JT8iSzqzc9WuaNHhyM84: '/register',
  b7qpdUa2HMiZT43GBmRCBm: '/forgot-password',
  wttFzRaqonYjntcavDSG6e: '/reset-password',
  vSum2cEi8fg5ASaUJEzvnn: '/donor',
  o9pThJqSXhyihjRjaJM5gv: '/alerts/r1',
  j7228o8P61Z2CW1kNDAKoD: '/hospital',
  '78eiisFvUcAAvk4Ncix4GU': '/requests/r1/escalation',
  j4rnZZWqnhMNALKdHZ8T8d: '/admin',
  owNKu9EWzffBBsA7MbPmgu: '/states',
  kDGeYDgpar9A2bHfAUa964: '/nope',
}
