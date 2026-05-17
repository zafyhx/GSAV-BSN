import { Transaction, Budget, Category } from '@/types'

// ---------------------------------------------------------------------------
// Dummy Categories — pakai data default beneran supaya konsisten dengan app
// ---------------------------------------------------------------------------
export const DUMMY_CATEGORIES: Category[] = [
  { id: 'cat-makan',     user_id: 'tour', name: 'Makan',       icon: 'Utensils',    color: '#f97316', is_default: true, created_at: '' },
  { id: 'cat-transport', user_id: 'tour', name: 'Transport',   icon: 'Car',         color: '#3b82f6', is_default: true, created_at: '' },
  { id: 'cat-nongkrong', user_id: 'tour', name: 'Nongkrong',   icon: 'Coffee',      color: '#a855f7', is_default: true, created_at: '' },
  { id: 'cat-akademik',  user_id: 'tour', name: 'Akademik',    icon: 'BookOpen',    color: '#22c55e', is_default: true, created_at: '' },
  { id: 'cat-hiburan',   user_id: 'tour', name: 'Hiburan',     icon: 'Gamepad2',    color: '#ec4899', is_default: true, created_at: '' },
  { id: 'cat-tagihan',   user_id: 'tour', name: 'Tagihan',     icon: 'Zap',         color: '#eab308', is_default: true, created_at: '' },
  { id: 'cat-tabungan',  user_id: 'tour', name: 'Tabungan',    icon: 'PiggyBank',   color: '#14b8a6', is_default: true, created_at: '' },
  { id: 'cat-lainnya',   user_id: 'tour', name: 'Lainnya',     icon: 'Package',     color: '#64748b', is_default: true, created_at: '' },
  // Income categories
  { id: 'cat-bulanan',   user_id: 'tour', name: 'Uang Bulanan',icon: 'Wallet',      color: '#22c55e', is_default: true, created_at: '' },
  { id: 'cat-beasiswa',  user_id: 'tour', name: 'Beasiswa',    icon: 'GraduationCap', color: '#3b82f6', is_default: true, created_at: '' },
]

// ---------------------------------------------------------------------------
// Helper — buat tanggal relatif dari hari ini (hari ini - N hari)
// ---------------------------------------------------------------------------
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const catOf = (id: string) => DUMMY_CATEGORIES.find(c => c.id === id)!

// ---------------------------------------------------------------------------
// Dummy Transactions — 12 transaksi campuran income & expense, bulan ini
// ---------------------------------------------------------------------------
export const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1', user_id: 'tour', type: 'income',
    amount: 800_000, note: 'Uang bulanan dari orang tua',
    category_id: 'cat-bulanan', category: catOf('cat-bulanan'),
    transaction_date: daysAgo(14), created_at: daysAgo(14), updated_at: daysAgo(14),
  },
  {
    id: 'tx-2', user_id: 'tour', type: 'expense',
    amount: 25_000, note: 'Nasi Padang + Es Teh',
    category_id: 'cat-makan', category: catOf('cat-makan'),
    transaction_date: daysAgo(1), created_at: daysAgo(1), updated_at: daysAgo(1),
  },
  {
    id: 'tx-3', user_id: 'tour', type: 'expense',
    amount: 12_000, note: 'Grab ke kampus',
    category_id: 'cat-transport', category: catOf('cat-transport'),
    transaction_date: daysAgo(2), created_at: daysAgo(2), updated_at: daysAgo(2),
  },
  {
    id: 'tx-4', user_id: 'tour', type: 'expense',
    amount: 45_000, note: 'Ngopi sama teman di kafe',
    category_id: 'cat-nongkrong', category: catOf('cat-nongkrong'),
    transaction_date: daysAgo(3), created_at: daysAgo(3), updated_at: daysAgo(3),
  },
  {
    id: 'tx-5', user_id: 'tour', type: 'expense',
    amount: 18_000, note: 'Mie Ayam Pak Kumis',
    category_id: 'cat-makan', category: catOf('cat-makan'),
    transaction_date: daysAgo(4), created_at: daysAgo(4), updated_at: daysAgo(4),
  },
  {
    id: 'tx-6', user_id: 'tour', type: 'expense',
    amount: 50_000, note: 'Print & fotokopi tugas',
    category_id: 'cat-akademik', category: catOf('cat-akademik'),
    transaction_date: daysAgo(5), created_at: daysAgo(5), updated_at: daysAgo(5),
  },
  {
    id: 'tx-7', user_id: 'tour', type: 'expense',
    amount: 85_000, note: 'Quota internet bulanan',
    category_id: 'cat-tagihan', category: catOf('cat-tagihan'),
    transaction_date: daysAgo(6), created_at: daysAgo(6), updated_at: daysAgo(6),
  },
  {
    id: 'tx-8', user_id: 'tour', type: 'expense',
    amount: 30_000, note: 'Boba sama pacar',
    category_id: 'cat-nongkrong', category: catOf('cat-nongkrong'),
    transaction_date: daysAgo(7), created_at: daysAgo(7), updated_at: daysAgo(7),
  },
  {
    id: 'tx-9', user_id: 'tour', type: 'expense',
    amount: 15_000, note: 'Bensin motor',
    category_id: 'cat-transport', category: catOf('cat-transport'),
    transaction_date: daysAgo(8), created_at: daysAgo(8), updated_at: daysAgo(8),
  },
  {
    id: 'tx-10', user_id: 'tour', type: 'expense',
    amount: 60_000, note: 'Netflix bulanan',
    category_id: 'cat-hiburan', category: catOf('cat-hiburan'),
    transaction_date: daysAgo(9), created_at: daysAgo(9), updated_at: daysAgo(9),
  },
  {
    id: 'tx-11', user_id: 'tour', type: 'expense',
    amount: 22_000, note: 'Warteg makan siang',
    category_id: 'cat-makan', category: catOf('cat-makan'),
    transaction_date: daysAgo(10), created_at: daysAgo(10), updated_at: daysAgo(10),
  },
  {
    id: 'tx-12', user_id: 'tour', type: 'income',
    amount: 200_000, note: 'Beasiswa prestasi',
    category_id: 'cat-beasiswa', category: catOf('cat-beasiswa'),
    transaction_date: daysAgo(12), created_at: daysAgo(12), updated_at: daysAgo(12),
  },
]

// ---------------------------------------------------------------------------
// Dummy Budgets — 4 kategori dengan progress realistis
// ---------------------------------------------------------------------------
export const DUMMY_BUDGETS: Budget[] = [
  {
    id: 'bud-1', user_id: 'tour',
    category_id: 'cat-makan', category: catOf('cat-makan'),
    amount: 300_000, month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    created_at: '', updated_at: '',
  },
  {
    id: 'bud-2', user_id: 'tour',
    category_id: 'cat-transport', category: catOf('cat-transport'),
    amount: 100_000, month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    created_at: '', updated_at: '',
  },
  {
    id: 'bud-3', user_id: 'tour',
    category_id: 'cat-nongkrong', category: catOf('cat-nongkrong'),
    amount: 100_000, month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    created_at: '', updated_at: '',
  },
  {
    id: 'bud-4', user_id: 'tour',
    category_id: 'cat-tagihan', category: catOf('cat-tagihan'),
    amount: 150_000, month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    created_at: '', updated_at: '',
  },
]
