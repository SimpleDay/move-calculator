import { PropsWithChildren } from 'react'

export function AdminFormHeader({ children }: PropsWithChildren) {
  return <div className="form-header">{children}</div>
}
