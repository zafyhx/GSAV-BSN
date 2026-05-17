import { Category, ParsedTransaction } from '@/types'
import { parseAmountString } from '@/lib/utils/currency'

/**
 * GSAV Quick Add Parser
 * 
 * Supported formats (Opsi B - full numbers + suffix):
 *   "makan 15000"          → expense, makan, Rp 15.000
 *   "transport 8500"       → expense, transport, Rp 8.500
 *   "kos 500000"           → expense, best-match category, Rp 500.000
 *   "makan 15k"            → expense, makan, Rp 15.000  (bonus shorthand)
 *   "makan 1.5jt"          → expense, makan, Rp 1.500.000 (bonus shorthand)
 *   "+ gaji 1500000"       → income, Rp 1.500.000
 *   "nongkrong 50000 starbucks"  → note = "starbucks"
 */
export function parseQuickInput(
  input: string,
  categories: Category[]
): ParsedTransaction {
  const trimmed = input.trim()
  if (!trimmed) {
    return makeError('Input kosong')
  }

  const tokens = trimmed.split(/\s+/)
  let isIncome = false
  let startIdx = 0

  // Check income prefix "+" or "+gaji"
  if (tokens[0] === '+') {
    isIncome = true
    startIdx = 1
  } else if (tokens[0].startsWith('+') && tokens[0].length > 1) {
    isIncome = true
    tokens[0] = tokens[0].slice(1)
  }

  if (tokens.length - startIdx < 2) {
    return makeError('Format: [kategori] [jumlah] [catatan opsional]')
  }

  const categoryToken = tokens[startIdx].toLowerCase()
  const amountToken = tokens[startIdx + 1]
  const noteTokens = tokens.slice(startIdx + 2)

  // Parse amount
  const amount = parseAmountString(amountToken)
  if (!amount || amount <= 0) {
    return makeError(`Jumlah tidak valid: "${amountToken}"`)
  }

  // Fuzzy match category
  const matched = fuzzyMatchCategory(categoryToken, categories)

  return {
    category_name: categoryToken,
    matched_category: matched,
    amount,
    note: noteTokens.length > 0 ? noteTokens.join(' ') : null,
    type: isIncome ? 'income' : 'expense',
    is_valid: true,
  }
}

function fuzzyMatchCategory(input: string, categories: Category[]): Category | null {
  if (!categories.length) return null

  const lower = input.toLowerCase()

  // Exact match first
  const exact = categories.find(c => c.name.toLowerCase() === lower)
  if (exact) return exact

  // Prefix match
  const prefix = categories.find(c => c.name.toLowerCase().startsWith(lower))
  if (prefix) return prefix

  // Contains match
  const contains = categories.find(c => c.name.toLowerCase().includes(lower))
  if (contains) return contains

  // Input contains category name
  const reverse = categories.find(c => lower.includes(c.name.toLowerCase()))
  if (reverse) return reverse

  return null
}

function makeError(error: string): ParsedTransaction {
  return {
    category_name: '',
    matched_category: null,
    amount: 0,
    note: null,
    type: 'expense',
    is_valid: false,
    error,
  }
}
