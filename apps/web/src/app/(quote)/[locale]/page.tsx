import { demoTenant } from '@/features/tenants/model/demoTenant'
import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function QuoteIndexPage({ params }: PageProps) {
  const { locale } = await params
  redirect(`/${locale}/${demoTenant.slug}`)
}
