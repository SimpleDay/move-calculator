import { AdminFieldError } from '@/lib/auth/components/AdminFieldError'
import { cn } from '@/lib/ui'
import { PropsWithChildren } from 'react'
import { useFormContext } from 'react-hook-form'

type AdminFieldProps = PropsWithChildren<{
  name: string
  label: string
  type: string
  required?: boolean
  readOnly?: boolean
}>

export function AdminField({ children, name, label, required, type, readOnly }: AdminFieldProps) {
  const { getFieldState, formState } = useFormContext()
  const fieldState = getFieldState(name, formState)
  return (
    <div className={cn('field-type', type, fieldState.error && 'error', readOnly && 'read-only')}>
      <label className="field-label" htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="field-type__wrap">
        <AdminFieldError error={fieldState.error} />
        {children}
      </div>
    </div>
  )
}
