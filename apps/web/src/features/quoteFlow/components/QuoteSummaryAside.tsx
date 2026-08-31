import type { QuoteDraft } from '@/features/quoteFlow/model'
import { Box, CalendarDays, LockKeyhole, Route } from 'lucide-react'

type QuoteSummaryAsideProps = {
  draft: QuoteDraft
}

export function QuoteSummaryAside({ draft }: QuoteSummaryAsideProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 space-y-4">
        <div className="rounded-2xl border border-[#dfe4de] bg-white p-5 shadow-[0_12px_35px_rgba(23,60,58,0.05)]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#78908a]">Ihre Angaben</p>
          <dl className="mt-5 space-y-4">
            <div className="flex gap-3">
              <Route aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--tenant-accent)]" />
              <div>
                <dt className="text-xs text-[#7b8985]">Route</dt>
                <dd className="mt-0.5 line-clamp-2 text-sm font-medium text-[#173c3a]">
                  {draft.fromAddress && draft.toAddress ? `${draft.fromAddress} → ${draft.toAddress}` : 'Noch offen'}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--tenant-accent)]" />
              <div>
                <dt className="text-xs text-[#7b8985]">Termin</dt>
                <dd className="mt-0.5 text-sm font-medium text-[#173c3a]">
                  {draft.moveDate
                    ? new Intl.DateTimeFormat('de-CH').format(new Date(`${draft.moveDate}T12:00:00`))
                    : 'Noch offen'}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Box aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--tenant-accent)]" />
              <div>
                <dt className="text-xs text-[#7b8985]">Volumen</dt>
                <dd className="mt-0.5 text-sm font-medium text-[#173c3a]">
                  {draft.volumeM3 > 0 ? `${draft.volumeM3} m³` : 'Noch offen'}
                </dd>
              </div>
            </div>
          </dl>
        </div>
        <div className="flex gap-3 rounded-2xl bg-[#e9f1ed] p-4 text-sm leading-5 text-[#315b55]">
          <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Der Preis erscheint erst nach Ihrer Zusammenfassung und den Kontaktangaben.</p>
        </div>
      </div>
    </aside>
  )
}
