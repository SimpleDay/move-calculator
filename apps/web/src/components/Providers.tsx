import { NextIntlClientProvider } from 'next-intl'
import { PropsWithChildren } from 'react'

export function Providers({ children }: PropsWithChildren) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>
}
