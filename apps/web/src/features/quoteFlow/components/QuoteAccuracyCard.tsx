import type { QuoteAccuracy } from '@/features/pricing/model'
import { AlertTriangle, ScanSearch, ShieldCheck } from 'lucide-react'

const accuracyCopy = {
  high: {
    title: 'Gute Berechnungsbasis',
    description: 'Die Angaben führen zu einer stabilen Einsatz- und Preisplanung.',
    icon: ShieldCheck,
    colors: 'border-[#cfe0d7] bg-[#f3f8f5] text-[#315f53]',
  },
  medium: {
    title: 'Solide Richtofferte',
    description: 'Der angezeigte Preis ist plausibel; einzelne Angaben können ihn noch beeinflussen.',
    icon: ScanSearch,
    colors: 'border-[#e7dcc4] bg-[#fffaf0] text-[#725d34]',
  },
  low: {
    title: 'Kurze Prüfung empfohlen',
    description: 'Eine operative Grenze oder unsichere Angabe kann Team, Fahrzeug oder Preis verändern.',
    icon: AlertTriangle,
    colors: 'border-[#efcabb] bg-[#fff6f2] text-[#8f432d]',
  },
} as const

export function QuoteAccuracyCard({ accuracy }: { accuracy: QuoteAccuracy }) {
  const copy = accuracyCopy[accuracy.level]
  const Icon = copy.icon
  const primaryFactor = accuracy.factors[0]

  return (
    <section className={`mt-5 rounded-2xl border p-4 sm:p-5 ${copy.colors}`} data-testid="quote-accuracy">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/75">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold">{copy.title}</h2>
          <p className="mt-1 text-xs leading-5 opacity-80">{copy.description}</p>
          {primaryFactor ? (
            <p className="mt-2 text-xs leading-5">
              <span className="font-bold">Wichtigster Faktor:</span> {primaryFactor.title}. {primaryFactor.description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
