import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

export type EmailWithLinkProps = {
  href: string
  name?: string
  messages: {
    preview: string
    title: string
    description: string
    link: string
    alternative: string
    addendum: string
    greeting: string
  }
}

export default async function EmailWithLink({
  href,
  name,
  messages: { preview, title, link, description, alternative, addendum, greeting },
}: EmailWithLinkProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Preview>{preview}</Preview>
          <Container className="mx-auto my-12 max-w-[465px] rounded border border-solid border-slate-200 p-4">
            <Heading className="text-center">{title}</Heading>
            {name && (
              <Text>
                {greeting} {name},
              </Text>
            )}
            <Text>{description}</Text>
            <Section className="text-center">
              <Button
                className="my-8 rounded bg-black px-5 py-3 text-center text-xs font-semibold text-white no-underline"
                href={href}
              >
                {link}
              </Button>
            </Section>
            <Text>
              {alternative}
              <Link className="break-all" href={href}>
                {href}
              </Link>
            </Text>
            <Hr className="border-solid border-slate-200" />
            <Text className="text-xs leading-6 text-slate-500">{addendum}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

EmailWithLink.PreviewProps = {
  href: 'https://example.com/superlongurlwithmanywordsthatmightmesswiththelayout',
  name: 'Bob',
  messages: {
    greeting: 'Hello',
    preview: 'Preview',
    title: 'Title',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    link: 'Verify your email address',
    alternative: 'or copy and paste this URL into your browser: ',
    addendum: 'If you did not request this, please ignore this email.',
  },
} satisfies EmailWithLinkProps
