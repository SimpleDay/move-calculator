type Defined<T = unknown> = NonNullable<T>

export function isDefined<T extends Defined>(subject: T | null | undefined): subject is T {
  return subject !== null && subject !== undefined
}

export function ifDefined<T extends NonNullable<unknown>, R>(
  subject: T | undefined,
  transform: (subject: T) => R,
): R | undefined
export function ifDefined<T extends NonNullable<unknown>, R>(subject: T | null, transform: (subject: T) => R): R | null
export function ifDefined<T extends NonNullable<unknown>, R>(
  subject: T | null | undefined,
  transform: (subject: T) => R,
): R | null | undefined {
  if (isDefined(subject)) return transform(subject)
  return subject
}
