import type { PropsWithChildren, ReactNode } from 'react'

type StepLayoutProps = PropsWithChildren<{
  eyebrow: string
  title: string
  description: string
  aside?: ReactNode
}>

export function StepLayout({ eyebrow, title, description, aside, children }: StepLayoutProps) {
  return (
    <section className="quote-step" aria-labelledby="quote-step-title">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--tenant-accent)]">{eyebrow}</p>
          <h1
            className="text-balance text-[clamp(2rem,5vw,3.35rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#123b38]"
            id="quote-step-title"
          >
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-6 text-[#61716d] sm:text-base">{description}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}
