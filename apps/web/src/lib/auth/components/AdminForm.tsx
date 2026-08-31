import { FieldValues, FormProvider, FormProviderProps, SubmitHandler } from 'react-hook-form'

type Props<TFieldValues extends FieldValues, TContext = unknown, TTransformedValues = TFieldValues> = FormProviderProps<
  TFieldValues,
  TContext,
  TTransformedValues
> & {
  onSubmit: SubmitHandler<TTransformedValues>
}

export function AdminForm<TFieldValues extends FieldValues, TContext = unknown, TTransformedValues = TFieldValues>(
  props: Props<TFieldValues, TContext, TTransformedValues>,
) {
  return (
    <FormProvider {...props}>
      <form onSubmit={props.handleSubmit(props.onSubmit)} className="form login__form">
        {props.children}
      </form>
    </FormProvider>
  )
}
