import { QuoteCalculator } from '@/features/quoteFlow/components/QuoteCalculator'
import { getTenantConfigBySlug } from '@/features/tenants/business/tenantService'
import { toPublicTenantConfig } from '@/features/tenants/model/tenantConfig'
import { routing } from '@/i18n/routing'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ locale: string; tenantSlug: string }>
}

export default async function TenantQuotePage({ params }: PageProps) {
  const { locale, tenantSlug } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  const tenant = await getTenantConfigBySlug(tenantSlug)
  if (!tenant) {
    notFound()
  }
  setRequestLocale(locale)

  return (
    <QuoteCalculator
      locale={locale}
      mapsEmbedApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY?.trim() || null}
      tenant={toPublicTenantConfig(tenant)}
    />
  )
}
