import React, { useState } from 'react'

import SignIn from '../fWqrFXdXhgXU62nhxVEeFz.frame'
import ForgotPassword from '../rmMt7gR2ir9N8rHdLmvfjk.frame'
import ResetPassword from '../wJEeDbJbLqqL3xAkSgugW1.frame'
import Register from '../dnT3dvocV7JJeQaerEARcZ.frame'
import HospitalDashboard from '../k7ziBCETCe1X8Fo2bgWvQh.frame'
import DonorDashboard from '../eQPYmRnssH74CaTgSv9se7.frame'

const SIGN_IN = 'fWqrFXdXhgXU62nhxVEeFz'
const FORGOT = 'rmMt7gR2ir9N8rHdLmvfjk'
const RESET = 'wJEeDbJbLqqL3xAkSgugW1'
const REGISTER = 'dnT3dvocV7JJeQaerEARcZ'
const HOSPITAL = 'k7ziBCETCe1X8Fo2bgWvQh'
const DONOR = 'eQPYmRnssH74CaTgSv9se7'

/** Route → frame. */
const ROUTES: Record<string, string> = {
  '/login': SIGN_IN,
  '/forgot-password': FORGOT,
  '/reset-password': RESET,
  '/register': REGISTER,
  '/hospital': HOSPITAL,
  '/donor': DONOR,
}

/** The size every frame draws at, unless one exports its own. */
export const viewport = 'web'

export const args = {
  mockApi: true,
}

export const argTypes = {
  mockApi: { control: 'boolean' },
}

type Props = Partial<typeof args> & { start?: string }

export default function Prototype(props: Props) {
  const { mockApi, start } = { ...args, ...props }
  const [screen, setScreen] = useState(() => start ?? SIGN_IN)
  const [newEmail, setNewEmail] = useState('')

  function navigate(path: string) {
    const next = ROUTES[path.split('?')[0]]
    if (next) {
      window.history.pushState({}, '', path)
      setScreen(next)
    }
  }

  if (screen === FORGOT) {
    return (
      <ForgotPassword
        key={FORGOT}
        state="default"
        mockApi={mockApi}
        onNavigate={navigate}
        onOpenResetLink={() => setScreen(RESET)}
      />
    )
  }
  if (screen === RESET) {
    return <ResetPassword key={RESET} state="default" mockApi={mockApi} onNavigate={navigate} />
  }
  if (screen === REGISTER) {
    return (
      <Register key={REGISTER} state="default" mockApi={mockApi} onNavigate={navigate} onRegistered={setNewEmail} />
    )
  }
  if (screen === HOSPITAL) {
    return <HospitalDashboard key={HOSPITAL} mockApi={mockApi} onNavigate={navigate} />
  }
  if (screen === DONOR) {
    return <DonorDashboard key={DONOR} mockApi={mockApi} onNavigate={navigate} />
  }
  return <SignIn key={SIGN_IN} state="default" email={newEmail} mockApi={mockApi} onNavigate={navigate} />
}
