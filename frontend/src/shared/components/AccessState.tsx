import React from 'react'

import { homeFor, type Role } from '../lib/session'
import { BmLink } from './BmNav'

export type AccessKind = 'signed-out' | 'expired' | 'wrong-role' | 'unknown-role'

type Props = {
  kind: AccessKind
  /** The role the page is for. */
  required: Role
  /** The role the signed-in account actually has, for 'wrong-role'. */
  actual?: Role | null
  onNavigate?: (path: string) => void
  onSignOut?: () => void
}

/** What a protected page shows instead of itself when the session can't open it. */
export function AccessState({ kind, required, actual, onNavigate, onSignOut }: Props) {
  const area = required === 'hospital' ? 'hospital dashboard' : 'donor dashboard'
  const copy = {
    'signed-out': {
      title: 'Sign in to continue',
      body: `The ${area} is only available to signed-in ${required === 'hospital' ? 'hospitals' : 'donors'}.`,
    },
    expired: {
      title: 'Your session has ended',
      body: 'For your security you’ve been signed out. Sign in again to pick up where you left off.',
    },
    'wrong-role': {
      title: `This page is for ${required === 'hospital' ? 'hospitals' : 'donors'}`,
      body: `You’re signed in with a ${actual ?? 'different'} account, so the ${area} isn’t available to you.`,
    },
    'unknown-role': {
      title: 'We don’t recognise this account type',
      body: 'Your account isn’t set up as a hospital or a donor. Sign out and sign in again, or contact support if this keeps happening.',
    },
  }[kind]

  return (
    <section className="bm-card bm-access" role="alert" aria-labelledby="bm-access-title">
      <h1 id="bm-access-title" className="bm-card-title">{copy.title}</h1>
      <p className="bm-access-body">{copy.body}</p>
      <div className="bm-access-actions">
        {kind === 'wrong-role' && actual ? (
          <BmLink href={homeFor(actual)} onNavigate={onNavigate} className="bm-button">
            Go to my dashboard
          </BmLink>
        ) : kind === 'unknown-role' ? (
          <button type="button" className="bm-button" onClick={onSignOut}>
            Sign out
          </button>
        ) : (
          <BmLink href="/login" onNavigate={onNavigate} className="bm-button">
            Sign in
          </BmLink>
        )}
        {kind === 'signed-out' && (
          <p className="bm-register">
            New to Bloodmatcher? <BmLink href="/register" onNavigate={onNavigate}>Create an account</BmLink>
          </p>
        )}
      </div>
    </section>
  )
}
