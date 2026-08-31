import { App, getApp } from '@/getApp'
import { defaultHttpErrorDetails, HttpError, HttpErrorDetails } from '@/lib/next/httpError'
import { input, output, ZodObject } from 'zod'

type HandlerOutput<OUT> = OUT extends ZodObject ? output<OUT> : void

export class ServerActionBuilder<IN extends ZodObject, OUT extends ZodObject | undefined = undefined> {
  static create<IN extends ZodObject>(inputSchema: IN) {
    return new ServerActionBuilder(inputSchema)
  }

  private constructor(
    private readonly inputSchema: IN,
    private readonly responseSchema?: OUT,
  ) {}

  withResponse<O extends ZodObject>(responseSchema: O) {
    return new ServerActionBuilder(this.inputSchema, responseSchema)
  }

  handle(
    handler: (request: { data: output<IN>; context: App }) => Promise<HandlerOutput<OUT>> | HandlerOutput<OUT>,
  ): (
    input: input<IN>,
  ) => Promise<{ data: HandlerOutput<OUT>; error: undefined } | { data: undefined; error: HttpErrorDetails }> {
    return async (input) => {
      const context = await getApp()
      try {
        const parsedInput = this.inputSchema.parse(input)
        const out = await context.runInTransaction(async () => await handler({ data: parsedInput, context }))
        if (this.responseSchema) {
          return { data: this.responseSchema.parse(out) as HandlerOutput<OUT>, error: undefined }
        } else {
          return { data: out, error: undefined }
        }
      } catch (error) {
        context.payload.logger.error({ error })
        if (error instanceof HttpError) {
          return { data: undefined, error: error.details }
        }
        return { data: undefined, error: defaultHttpErrorDetails }
      }
    }
  }
}
