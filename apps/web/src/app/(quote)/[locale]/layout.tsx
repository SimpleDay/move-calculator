import { Providers } from '@/components/Providers'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import './globals.css'

type LayoutProps = PropsWithChildren<{
  params: Promise<{ locale: string }>
}>

export default async function QuoteLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Ihre Zügelofferte',
  description: 'In wenigen Minuten zur persönlichen und unverbindlichen Zügelofferte.',
  icons: { icon: '/favicon.svg' },
  robots: { index: false, follow: false },
}
