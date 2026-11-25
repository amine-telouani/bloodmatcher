import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { MapPin, Search, LocateFixed, ArrowUpRight } from 'lucide-react'
import type { Map as LeafletMap, Marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const POINTS = [
  { id: 'centre', name: 'Central Casablanca', area: 'Casablanca, Morocco', kind: 'City centre', lat: 33.5731, lng: -7.5898 },
  { id: 'coastal', name: 'Coastal Casablanca', area: 'Casablanca, Morocco', kind: 'Coastal area', lat: 33.598, lng: -7.638 },
  { id: 'north', name: 'Northern Casablanca', area: 'Casablanca, Morocco', kind: 'Northern area', lat: 33.604, lng: -7.586 },
  { id: 'south', name: 'Southern Casablanca', area: 'Casablanca, Morocco', kind: 'Southern area', lat: 33.547, lng: -7.609 },
] as const

export function NetworkMap() {
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const map = useRef<LeafletMap | null>(null)
  const markers = useRef(new Map<string, Marker>())
  const visible = useInView(section, { once: true, margin: '200px' })
  const reduced = useReducedMotion()
  const [selected, setSelected] = useState<string>(POINTS[0].id)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [tilesUnavailable, setTilesUnavailable] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const initial = useRef(POINTS[0].id)
  const shown = POINTS.filter(p => `${p.name} ${p.area} ${p.kind}`.toLowerCase().includes(query.trim().toLowerCase()))
  const active = POINTS.find(p => p.id === selected) ?? POINTS[0]

  useEffect(() => {
    if (!visible || !canvas.current) return
    let cancelled = false
    let instance: LeafletMap | null = null
    let observer: ResizeObserver | undefined
    setStatus('loading')
    setTilesUnavailable(false)
    const initialize = async () => {
      try {
        const L = await import('leaflet')
        if (cancelled || !canvas.current) return
        instance = L.map(canvas.current, { scrollWheelZoom: false, zoomAnimation: false, zoomControl: false, attributionControl: true }).setView([33.576, -7.611], 12)
        map.current = instance
        L.control.zoom({ position: 'topright' }).addTo(instance)
        const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        }).addTo(instance)
        tiles.on('tileerror', () => { if (!cancelled) setTilesUnavailable(true) })
        for (const point of POINTS) {
          const marker = L.marker([point.lat, point.lng], {
            title: point.name,
            alt: `Select ${point.name}`,
            keyboard: true,
            icon: L.icon({ className: 'network-pin', iconUrl: '/images/map/location-pin.svg', iconSize: [40, 40], iconAnchor: [20, 37], popupAnchor: [0, -38] }),
          }).addTo(instance)
          const popup = document.createElement('div')
          const label = document.createElement('span')
          label.className = 'network-popup-kind'
          label.textContent = point.kind
          const title = document.createElement('strong')
          title.textContent = point.name
          const location = document.createElement('span')
          location.textContent = point.area
          popup.append(label, title, location)
          marker.bindPopup(popup, { className: 'network-popup', minWidth: 210, maxWidth: 260, closeButton: true, autoPan: true, keepInView: true, autoPanPaddingTopLeft: [12, 80], autoPanPaddingBottomRight: [12, 55] })
          marker.on('click', () => setSelected(point.id))
          markers.current.set(point.id, marker)
        }
        const selectedMarker = markers.current.get(initial.current)
        selectedMarker?.openPopup()
        selectedMarker?.getElement()?.classList.add('is-selected')
        observer = new ResizeObserver(() => {
          instance?.invalidateSize({ pan: false })
          for (const marker of markers.current.values()) {
            if (marker.isPopupOpen()) marker.getPopup()?.update()
          }
        })
        observer.observe(canvas.current)
        setStatus('ready')
      } catch { if (!cancelled) setStatus('error') }
    }
    initialize()
    return () => {
      cancelled = true
      observer?.disconnect()
      instance?.remove()
      map.current = null
      markers.current.clear()
    }
  }, [visible, attempt])

  const select = (id: string) => {
    setSelected(id)
    const point = POINTS.find(p => p.id === id)
    if (point && map.current) {
      map.current.setView([point.lat, point.lng], 13, { animate: !reduced })
      markers.current.get(id)?.openPopup()
    }
  }

  useEffect(() => {
    for (const [id, marker] of markers.current) {
      marker.getElement()?.classList.toggle('is-selected', id === selected)
      if (id === selected) marker.openPopup()
    }
  }, [selected, status])

  return (
    <section ref={section} id="network" data-tone="cream" aria-labelledby="network-title" className="network-section pt-16 sm:pt-24">
      <div className="mx-auto mb-9 grid max-w-6xl gap-5 px-5 sm:px-8 md:grid-cols-2 md:items-end">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-red-deep">Closer than you think</p>
          <h2 id="network-title" className="font-display text-4xl font-semibold leading-tight sm:text-5xl">A local network,<br />within reach.</h2>
        </div>
        <p className="max-w-md text-lg leading-relaxed text-ink-soft">Explore Casablanca. Select an area on the map or use the list below to bring its surroundings into focus.</p>
      </div>
      <div className="network-frame" data-map-status={status}>
        <div ref={canvas} className="network-canvas" role="region" aria-label="Interactive map of Casablanca" />
        <div className="network-badge"><span /> Casablanca · Neighbourhoods</div>
        <button type="button" className="network-reset" onClick={() => { map.current?.closePopup(); map.current?.fitBounds(POINTS.map(p => [p.lat, p.lng]), { padding: [50, 65], animate: !reduced }); setQuery('') }} disabled={status !== 'ready'}>
          <LocateFixed size={17} aria-hidden /> Show all areas
        </button>
        {status === 'loading' && <p className="network-message" role="status">Loading the neighbourhood map…</p>}
        {status === 'error' && <div className="network-message" role="status"><p>The map could not load. The location list is still available below.</p><button type="button" onClick={() => setAttempt(a => a + 1)}>Try again</button></div>}
        {tilesUnavailable && status === 'ready' && <p className="network-tile-note" role="status">Some map tiles are unavailable. Pins and the location list remain usable.</p>}
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-6 sm:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink-soft" aria-live="polite">Selected: <strong className="font-semibold text-ink">{active.name}</strong></p>
          <label className="network-search"><Search size={17} aria-hidden /><span className="sr-only">Search areas</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search areas" type="search" /></label>
        </div>
        <ul className="network-locations" aria-label="Casablanca areas">
          {shown.map(point => <li key={point.id}><button type="button" className={`network-location ${selected === point.id ? 'is-selected' : ''}`} aria-pressed={selected === point.id} onClick={() => select(point.id)}>
            <span className="network-location-kind">{point.kind}<ArrowUpRight size={16} aria-hidden /></span>
            <strong>{point.name}</strong><span className="network-location-area"><MapPin size={14} aria-hidden />{point.area}</span>
          </button></li>)}
        </ul>
        {shown.length === 0 && <p role="status" className="rounded-2xl bg-paper p-5 text-ink-soft">No areas match that search. Try “central” or “coastal”.</p>}
        <p className="mt-5 text-sm leading-relaxed text-muted">Explore the city, then sign in to view requests matched to your profile.</p>
      </div>
    </section>
  )
}
