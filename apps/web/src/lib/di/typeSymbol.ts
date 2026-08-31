export type TypeSymbol<T> = symbol & { __type: T }

export function typeSymbol<T>(name: string): TypeSymbol<T> {
  // use Symbol.for() instead of Symbol() to avoid HMR issues
  return Symbol.for(name) as TypeSymbol<T>
}
