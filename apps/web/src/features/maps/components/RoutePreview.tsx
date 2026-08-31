import { Clock3, MapPinned, Route } from 'lucide-react'

type RoutePreviewProps = {
  destination: string
  distanceKm: number
  durationMinutes: number | null
  embedApiKey: string | null
  isLoading: boolean
  origin: string
  routeSource: 'google' | 'manual'
}

function createEmbedUrl(apiKey: string, origin: string, destination: string): string {
  const query = new URLSearchParams({
    key: apiKey,
    origin,
    destination,
    mode: 'driving',
    units: 'metric',
    language: 'de',
    region: 'ch',
  })
  return `https://www.google.com/maps/embed/v1/directions?${query}`
}

export function RoutePreview({
  destination,
  distanceKm,
  durationMinutes,
  embedApiKey,
  isLoading,
  origin,
  routeSource,
}: RoutePreviewProps) {
  const canEmbed = embedApiKey && origin.length >= 3 && destination.length >= 3
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#d9e1dc] bg-[#eef3ef]">
      <div className="relative h-52 overflow-hidden bg-[#dfe9e2] sm:h-56">
        {canEmbed ? (
          <iframe
            allowFullScreen
            className="size-full border-0"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={createEmbedUrl(embedApiKey, origin, destination)}
            title="Fahrroute von der Start- zur Zieladresse"
          />
        ) : (
          <FallbackRoute destination={destination} origin={origin} />
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-[#315d58] shadow-md backdrop-blur">
          <MapPinned className="size-4 text-[var(--tenant-accent)]" />
          {isLoading ? 'Route wird berechnet …' : routeSource === 'google' ? 'Fahrroute validiert' : 'Routenvorschau'}
        </div>
      </div>
      <div className="grid gap-3 border-t border-[#d5dfd8] bg-white p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-xs text-[#72817d]">{origin}</p>
          <p className="mt-1 truncate text-sm font-semibold text-[#173c3a]">{destination}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-[#f1f5f1] px-3 py-2 text-sm font-bold text-[#315d58]">
          <Route className="size-4" /> {distanceKm > 0 ? `${distanceKm.toLocaleString('de-CH')} km` : '– km'}
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-[#f1f5f1] px-3 py-2 text-sm font-bold text-[#315d58]">
          <Clock3 className="size-4" /> {durationMinutes ? `${durationMinutes} Min.` : '– Min.'}
        </div>
      </div>
    </section>
  )
}

function FallbackRoute({ origin, destination }: Pick<RoutePreviewProps, 'destination' | 'origin'>) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,#e8efe9_0%,#dce7df_48%,#eef1e8_100%)]">
      <div className="absolute -left-8 top-9 h-1 w-[48%] rotate-[11deg] rounded-full bg-white/60" />
      <div className="absolute -right-12 bottom-12 h-1 w-[65%] -rotate-[16deg] rounded-full bg-white/70" />
      <div className="absolute left-[17%] top-[22%] h-[58%] w-[66%] rotate-[-7deg] rounded-[50%] border-[3px] border-dashed border-[#6e9b8d]/70" />
      <div className="absolute left-[13%] top-[18%] flex size-10 items-center justify-center rounded-full border-4 border-white bg-[#173c3a] text-xs font-black text-white shadow-lg">
        A
      </div>
      <div className="absolute bottom-[17%] right-[13%] flex size-10 items-center justify-center rounded-full border-4 border-white bg-[var(--tenant-accent)] text-xs font-black text-white shadow-lg">
        B
      </div>
      <span className="absolute left-[8%] top-[calc(18%+3rem)] max-w-[35%] truncate rounded-lg bg-white/85 px-2 py-1 text-[10px] font-semibold text-[#45645e]">
        {origin || 'Start'}
      </span>
      <span className="absolute bottom-[6%] right-[7%] max-w-[35%] truncate rounded-lg bg-white/85 px-2 py-1 text-[10px] font-semibold text-[#45645e]">
        {destination || 'Ziel'}
      </span>
    </div>
  )
}
