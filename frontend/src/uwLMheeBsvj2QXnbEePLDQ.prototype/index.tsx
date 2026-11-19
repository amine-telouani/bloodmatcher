import React, { useState } from 'react'

import Home from '../1WUQztQZipTVEmugphuJqM.frame'
import SignIn from '../8xqE7k7wCsciXcaxWgwbsu.frame'
import Register from '../q3JT8iSzqzc9WuaNHhyM84.frame'
import ForgotPassword from '../b7qpdUa2HMiZT43GBmRCBm.frame'
import ResetPassword from '../wttFzRaqonYjntcavDSG6e.frame'
import DonorDashboard from '../vSum2cEi8fg5ASaUJEzvnn.frame'
import DonorAlert from '../o9pThJqSXhyihjRjaJM5gv.frame'
import HospitalDashboard from '../j7228o8P61Z2CW1kNDAKoD.frame'
import RequestTimeline from '../78eiisFvUcAAvk4Ncix4GU.frame'
import Admin from '../j4rnZZWqnhMNALKdHZ8T8d.frame'
import States from '../owNKu9EWzffBBsA7MbPmgu.frame'
import NotFound from '../kDGeYDgpar9A2bHfAUa964.frame'

const HOME = '1WUQztQZipTVEmugphuJqM'

/** The size every frame draws at, unless one exports its own. */
export const viewport = 'web'

type Props = { start?: string }

export default function Prototype({ start }: Props) {
  const [path, setPath] = useState(() => (start ? idToPath[start] ?? '/' : '/'))
  const go = (p: string) => setPath(p.split('?')[0] ?? '/')

  const alert = path.match(/^\/alerts\/([^/]+)/)
  const timeline = path.match(/^\/requests\/([^/]+)\/escalation/)

  if (alert) return <DonorAlert id={alert[1]} onNavigate={go} />
  if (timeline) return <RequestTimeline id={timeline[1]} onNavigate={go} />
  switch (path) {
    case '/':
      return <Home onNavigate={go} />
    case '/login':
      return <SignIn onNavigate={go} />
    case '/register':
      return <Register onNavigate={go} />
    case '/forgot-password':
      return <ForgotPassword onNavigate={go} />
    case '/reset-password':
      return <ResetPassword onNavigate={go} />
    case '/donor':
      return <DonorDashboard onNavigate={go} />
    case '/hospital':
      return <HospitalDashboard onNavigate={go} />
    case '/admin':
      return <Admin onNavigate={go} />
    case '/states':
      return <States onNavigate={go} />
    default:
      return <NotFound onNavigate={go} />
  }
}

const idToPath: Record<string, string> = {
  [HOME]: '/',
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
