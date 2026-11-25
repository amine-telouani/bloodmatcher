import React, { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { ArrowLeft, Info, MapPin } from 'lucide-react'

import { NavProvider } from '../shared/nav/Nav'
import { Navbar } from '../shared/components/Navbar'
import { RequestCard } from '../shared/components/RequestCard'
import { UrgencyBloodBag } from '../shared/components/UrgencyBloodBag'
import { DonationWindowCard } from '../shared/components/DonationWindowCard'
import { buttonClass } from '../shared/components/buttonStyles'
import { SAMPLE_DONORS, SAMPLE_REQUESTS, type SampleDonorScenario } from '../shared/preview/sampleData'
import type { RequestResponse, Urgency } from '../shared/types'

type Props = Partial<typeof args> & { onBack?: () => void }

export default function DashboardPreview(props: Props) {
  const { donorScenario, selectedRequest, onBack } = { ...args, ...props }
  const donor = SAMPLE_DONORS[donorScenario as SampleDonorScenario] ?? SAMPLE_DONORS.waiting
  const [selected, setSelected] = useState<string>(idFor(selectedRequest))
  const [responses, setResponses] = useState<Record<string, RequestResponse>>({})

  useEffect(() => setSelected(idFor(selectedRequest)), [selectedRequest])

  return (
    <MotionConfig reducedMotion="user">
      <NavProvider navigate={() => onBack?.()}>
        <div className="animation-page min-h-screen min-w-0 overflow-x-clip bg-cream pb-16 font-sans text-ink">
          <Navbar variant="app" roleLabel="Donor" onHome={onBack} />

          <main className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                {onBack && (
                  <button type="button" onClick={onBack} className={buttonClass('quiet', 'sm', 'mb-3 text-sm')}>
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Back to the landing page
                  </button>
                )}
                <h1 className="font-display text-4xl font-semibold leading-tight">Hello, {donor.fullName.split(' ')[0]}</h1>
              </div>
              <p className="inline-flex items-center gap-2 rounded-full bg-blush px-3.5 py-1.5 text-sm font-medium text-ink">
                <Info className="h-4 w-4 shrink-0" aria-hidden />
                Interface preview · sample data
              </p>
            </div>

            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <section aria-labelledby="requests-title">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 id="requests-title" className="font-display text-2xl font-semibold">
                    Requests for you
                  </h2>
                  <p className="text-sm text-muted">Compatible with {donor.bloodType}</p>
                </div>
                {donor.available ? (
                  <ul className="mt-4 flex flex-col gap-4">
                    {SAMPLE_REQUESTS.map((r) => (
                      <li key={r.id}>
                        <RequestCard
                          request={r}
                          selected={selected === r.id}
                          onSelect={() => setSelected(r.id)}
                          response={responses[r.id] ?? 'open'}
                          onAccept={() => setResponses((s) => ({ ...s, [r.id]: 'accepted' }))}
                          onDecline={() => setResponses((s) => ({ ...s, [r.id]: 'declined' }))}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 rounded-3xl bg-paper p-6 ring-1 ring-ink/10">
                    <p className="font-display text-xl font-semibold">No alerts while you're unavailable</p>
                    <p className="mt-1 leading-relaxed text-ink-soft">
                      Requests appear here again once you switch your availability back on.
                    </p>
                  </div>
                )}
              </section>

              <aside className="flex flex-col gap-4" aria-label="Your donor status">
                <DonationWindowCard lastDonationDate={donor.lastDonationDate} available={donor.available} />
                <div className="flex items-center justify-between gap-4 rounded-3xl bg-paper p-5 ring-1 ring-ink/10">
                  <div>
                    <p className="text-sm text-muted">Blood type</p>
                    <p className="font-display text-2xl font-semibold">{donor.bloodType}</p>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-ink">
                    <MapPin className="h-4 w-4 text-red-dark" aria-hidden />
                    {donor.latitude != null && donor.longitude != null ? 'Location set' : 'No location set'}
                  </p>
                </div>
              </aside>
            </div>

            <section aria-labelledby="states-title" className="mt-16 border-t border-ink/15 pt-10">
              <h2 id="states-title" className="font-display text-2xl font-semibold">
                Component states
              </h2>
              <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">
                The bag is a symbol of urgency — fuller is calmer — not stock, units fulfilled or a live count. Every level carries
                its written label.
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-6">
                {URGENCIES.map((u) => (
                  <li key={u}>
                    <UrgencyBloodBag urgency={u} size="lg" />
                  </li>
                ))}
              </ul>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {(Object.keys(SAMPLE_DONORS) as SampleDonorScenario[]).map((key) => (
                  <div key={key} className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-muted">{SCENARIO_LABELS[key]}</p>
                    <DonationWindowCard
                      className="flex-1"
                      lastDonationDate={SAMPLE_DONORS[key].lastDonationDate}
                      available={SAMPLE_DONORS[key].available}
                    />
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </NavProvider>
    </MotionConfig>
  )
}

export const args = {
  donorScenario: 'waiting',
  selectedRequest: 'critical',
}

export const argTypes = {
  donorScenario: { control: 'select', options: ['waiting', 'open', 'no-record', 'unavailable'] },
  selectedRequest: { control: 'radio', options: ['none', 'critical', 'urgent', 'normal'] },
}

const idFor = (s: string) => (s === 'none' ? '' : `sample-${s}`)

const URGENCIES: Urgency[] = ['NORMAL', 'URGENT', 'CRITICAL']

const SCENARIO_LABELS: Record<SampleDonorScenario, string> = {
  waiting: 'In waiting period',
  open: 'Window open',
  'no-record': 'No donation recorded',
  unavailable: 'Set to unavailable',
}
