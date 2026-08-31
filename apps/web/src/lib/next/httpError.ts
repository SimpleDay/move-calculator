import { z } from 'zod'

export const httpErrorDetailsSchema = z.object({
  status: z.number(),
  title: z.string(),
  code: z.string().optional(),
})

export type HttpErrorDetails = z.infer<typeof httpErrorDetailsSchema>

export class HttpError extends Error {
  constructor(readonly details: HttpErrorDetails = defaultHttpErrorDetails) {
    super(details.title)
  }
}

export const defaultHttpErrorDetails = {
  status: 500,
  title: 'Internal Server Error',
} as const satisfies HttpErrorDetails
