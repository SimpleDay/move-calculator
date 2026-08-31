import { PropsWithChildren } from 'react'

export function AdminFormFields({ children }: PropsWithChildren) {
  return <div className="login__form__inputWrap">{children}</div>
}
