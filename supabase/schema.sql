-- ============================================================
-- GSAV — Budget Spending Navigator
-- Supabase PostgreSQL Schema
-- 
-- CARA PAKAI:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Paste seluruh isi file ini
-- 3. Klik Run
-- ============================================================


-- ============================================================
-- 1. PROFILES
-- Extended dari auth.users Supabase
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  monthly_income DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'IDR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profile data extended from Supabase Auth';


-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Package',
  color TEXT NOT NULL DEFAULT '#64748b',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
COMMENT ON TABLE public.categories IS 'Spending categories per user';


-- ============================================================
-- 3. TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  note TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_month 
  ON public.transactions(user_id, transaction_date DESC);

COMMENT ON TABLE public.transactions IS 'Financial transactions (income and expense)';


-- ============================================================
-- 4. BUDGETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL CHECK (year >= 2020),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_period 
  ON public.budgets(user_id, year, month);

COMMENT ON TABLE public.budgets IS 'Monthly budget limits per category';


-- ============================================================
-- 5. INSIGHTS (optional, for cached insights)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('warning', 'info', 'tip', 'danger')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_insights_user_id 
  ON public.insights(user_id, is_read);


-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- Penting! Setiap user hanya bisa akses data sendiri
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Insights policies
CREATE POLICY "Users can view own insights" ON public.insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own insights" ON public.insights
  FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- 7. TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 8. FUNCTION: Auto-seed default categories for new user
-- Called after profile is created
-- ============================================================
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, icon, color, is_default) VALUES
    (p_user_id, 'Makan', 'Utensils', '#f97316', true),
    (p_user_id, 'Transport', 'Car', '#3b82f6', true),
    (p_user_id, 'Nongkrong', 'Coffee', '#a855f7', true),
    (p_user_id, 'Akademik', 'BookOpen', '#22c55e', true),
    (p_user_id, 'Hiburan', 'Gamepad2', '#ec4899', true),
    (p_user_id, 'Tagihan', 'Zap', '#eab308', true),
    (p_user_id, 'Tabungan', 'PiggyBank', '#14b8a6', true),
    (p_user_id, 'Uang Masuk', 'Wallet', '#22c55e', true),
    (p_user_id, 'Lainnya', 'Package', '#64748b', true)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-seed on new profile creation
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.seed_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();


-- ============================================================
-- SELESAI! Jalankan script ini di Supabase SQL Editor.
-- Default categories akan otomatis dibuat saat user daftar.
-- ============================================================
