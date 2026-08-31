import { Body, Container, Head, Heading, Hr, Html, Preview, Tailwind, Text } from '@react-email/components'

export type EmailProps = {
  name?: string
  messages: {
    preview: string
    title: string
    description: string
    addendum: string
    greeting: string
  }
}

export default async function Email({
  name,
  messages: { preview, title, description, addendum, greeting },
}: EmailProps) {
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
            <Hr className="border-solid border-slate-200" />
            <Text className="text-xs leading-6 text-slate-500">{addendum}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

Email.PreviewProps = {
  name: 'Bob',
  messages: {
    greeting: 'Hello',
    preview: 'Preview',
    title: 'Title',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    addendum: 'If you did not request this, please ignore this email.',
  },
} satisfies EmailProps
