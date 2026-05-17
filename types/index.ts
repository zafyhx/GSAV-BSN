// Centralized TypeScript types for GSAV

export type TransactionType = 'income' | 'expense'

export type InsightType = 'warning' | 'info' | 'tip' | 'danger'

export interface Profile {
  id: string
  display_name: string | null
  monthly_income: number
  currency: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  is_default: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  type: TransactionType
  note: string | null
  transaction_date: string
  created_at: string
  updated_at: string
  // Joined
  category?: Category | null
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  month: number
  year: number
  created_at: string
  updated_at: string
  // Joined
  category?: Category | null
  // Computed
  spent?: number
  remaining?: number
  percentage?: number
}

export interface Insight {
  id: string
  user_id: string
  type: InsightType
  message: string
  is_read: boolean
  generated_at: string
  expires_at: string | null
}

// ---- Computed / View types ----

export interface FinancialSummary {
  balance: number
  income_this_month: number
  expense_this_month: number
  daily_burn_rate: number
  days_remaining: number | null
  budget_remaining: number | null
}

export interface CategorySpending {
  category: Category
  total: number
  percentage: number
  count: number
}

export interface DailySpending {
  date: string
  total: number
  label: string
}

// ---- Quick Add Parser ----

export interface ParsedTransaction {
  category_name: string
  matched_category: Category | null
  amount: number
  note: string | null
  type: TransactionType
  is_valid: boolean
  error?: string
}

// ---- Form Types ----

export interface TransactionFormData {
  amount: string
  category_id: string
  type: TransactionType
  note: string
  transaction_date: string
}

export interface BudgetFormData {
  category_id: string
  amount: string
}
