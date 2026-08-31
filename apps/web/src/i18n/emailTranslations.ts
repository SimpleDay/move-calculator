import { createTranslator, Locale, NamespaceKeys, NestedKeyOf } from 'next-intl'
import messagesEn from '../../messages/email/en.json'

// Define the shape of all translator messages, based on the English messages
type TranslatorMessages = typeof messagesEn

type Translator<N extends NamespaceKeys<TranslatorMessages, NestedKeyOf<TranslatorMessages>>> = ReturnType<
  typeof createTranslator<TranslatorMessages, N>
>

export async function getEmailTranslator<N extends NamespaceKeys<TranslatorMessages, NestedKeyOf<TranslatorMessages>>>({
  locale,
  namespace,
}: {
  locale: Locale
  namespace: N
}) {
  return createTranslator({
    locale,
    namespace: namespace,
    messages: (await import(`@/messages/email/${locale}.json`)).default,
  }) as Translator<N>
}
