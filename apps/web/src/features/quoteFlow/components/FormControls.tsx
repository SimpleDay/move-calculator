import { cn } from '@/lib/ui'
import type { InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes } from 'react'

export const inputClassName =
  'min-h-12 w-full rounded-xl border border-[#d8ded8] bg-white px-4 py-3 text-[15px] text-[#173c3a] shadow-[0_1px_0_rgba(23,60,58,0.03)] outline-none transition placeholder:text-[#8b9995] focus:border-[var(--tenant-accent)] focus:ring-3 focus:ring-[color-mix(in_srgb,var(--tenant-accent)_16%,transparent)]'

type FieldProps = PropsWithChildren<{
  label: string
  htmlFor: string
  hint?: string
  optional?: boolean
}>

export function Field({ label, htmlFor, hint, optional, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label
        className="flex items-baseline justify-between gap-3 text-sm font-semibold text-[#173c3a]"
        htmlFor={htmlFor}
      >
        <span>{label}</span>
        {optional ? <span className="text-xs font-normal text-[#71807c]">Optional</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs leading-5 text-[#71807c]">{hint}</p> : null}
    </div>
  )
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClassName, className)} {...props} />
}

export function SelectInput({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputClassName, 'appearance-none pr-10', className)} {...props} />
}
