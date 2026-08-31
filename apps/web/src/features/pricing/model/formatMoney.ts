export function formatMoneyRappen(amountRappen: number, locale = 'de-CH'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountRappen / 100)
}
