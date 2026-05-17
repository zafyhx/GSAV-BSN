/**
 * Currency utilities for GSAV
 * All amounts stored in IDR (full integer, no decimal)
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatAmount(amount: number): string {
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}jt`
  }
  if (amount >= 1_000) {
    const val = amount / 1_000
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}k`
  }
  return amount.toString()
}

export function formatCurrencyCompact(amount: number): string {
  return `Rp ${formatAmount(amount)}`
}

/** Parse amount string: "15000" → 15000, "15k" → 15000, "1.5jt" → 1500000 */
export function parseAmountString(raw: string): number | null {
  const cleaned = raw.trim().toLowerCase().replace(/,/g, '.')

  // Handle "jt" suffix (juta)
  if (cleaned.endsWith('jt')) {
    const num = parseFloat(cleaned.replace('jt', ''))
    if (isNaN(num)) return null
    return Math.round(num * 1_000_000)
  }

  // Handle "k" or "rb" suffix (ribu)
  if (cleaned.endsWith('k') || cleaned.endsWith('rb')) {
    const suffix = cleaned.endsWith('k') ? 'k' : 'rb'
    const num = parseFloat(cleaned.replace(suffix, ''))
    if (isNaN(num)) return null
    return Math.round(num * 1_000)
  }

  // Plain number
  const num = parseFloat(cleaned)
  if (isNaN(num) || num <= 0) return null
  return Math.round(num)
}
