import { Reveal } from '../../shared/components/Reveal'

const PHOTOS = [
  { src: 'donor-moment.jpg', alt: 'A donor being cared for during a community blood drive', title: 'A person who shows up', text: 'Every response starts with someone choosing to help.' },
  { src: 'care-team.jpg', alt: 'A healthcare professional caring for a donor’s arm', title: 'Care at every step', text: 'Hospital teams record the donation once it is complete.' },
  { src: 'community-drive.jpg', alt: 'Healthcare volunteers working together at an outdoor donation event', title: 'A community behind it', text: 'Donors and hospital staff each have a part to play.' },
]

export function CommunityGallery() {
  return (
    <section data-tone="cream" aria-labelledby="community-title" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mb-9 grid gap-5 md:grid-cols-2 md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-red-deep">The human side</p>
            <h2 id="community-title" className="font-display text-4xl font-semibold leading-tight sm:text-5xl">Real people.<br />A shared purpose.</h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-ink-soft">The match happens online. The generosity, care and connection happen in person.</p>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {PHOTOS.map((photo, i) => (
            <Reveal key={photo.src} delay={i * 0.07} className="h-full">
              <figure className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-paper ring-1 ring-ink/10 motion-safe:transition-[translate,box-shadow] motion-safe:duration-[320ms] motion-safe:ease-out motion-safe:hover:-translate-y-1.5 motion-safe:hover:shadow-[0_16px_32px_-20px_rgba(96,32,44,0.45)]">
                <div className="overflow-hidden">
                  <img src={`/images/community/${photo.src}`} alt={photo.alt} width="1000" height="625" loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover motion-safe:transition-transform motion-safe:duration-[460ms] motion-safe:ease-out motion-safe:group-hover:scale-[1.025]" />
                </div>
                <figcaption className="p-6">
                  <h3 className="font-display text-2xl font-medium">{photo.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{photo.text}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
