import { Tooltip } from '@payloadcms/ui'
import { FieldError } from 'react-hook-form'

type AdminFieldErrorProps = {
  error?: FieldError
}

export function AdminFieldError({ error }: AdminFieldErrorProps) {
  const { message } = error || {}
  if (!message) return null
  return (
    <Tooltip alignCaret="right" className="field-error" delay={0} staticPositioning>
      {message}
    </Tooltip>
  )
}
