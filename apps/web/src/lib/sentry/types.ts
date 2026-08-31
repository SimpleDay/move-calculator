export type SpanOptions = {
  name?: string
}

export type InstrumentationService = {
  runInSpan: <T>(callback: () => T, otps?: SpanOptions) => T
}
