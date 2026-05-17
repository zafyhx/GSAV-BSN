'use client'

import { useState } from 'react'
import { useProfile, useUpdateProfile } from '@/lib/hooks/useProfile'
import { useCategories, useAddCategory, useDeleteCategory } from '@/lib/hooks/useCategories'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { parseAmountString, formatCurrency } from '@/lib/utils/currency'
import { User, DollarSign, LogOut, ChevronRight, Plus, TrendingUp, Trash2, HelpCircle } from 'lucide-react'
import { DynamicIcon, AVAILABLE_ICONS } from '@/components/ui/DynamicIcon'
import { BottomSheet } from '@/components/ui/BottomSheet'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = ['#f97316', '#3b82f6', '#a855f7', '#22c55e', '#ec4899', '#eab308', '#14b8a6', '#64748b', '#f87171', '#60a5fa']

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { data: profile, isLoading } = useProfile()
  const { data: categories = [] } = useCategories()
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile()
  const { mutate: addCategory, isPending: isAddingCat } = useAddCategory()
  const { mutate: deleteCategory } = useDeleteCategory()

  const [profileSheet, setProfileSheet] = useState(false)
  const [catSheet, setCatSheet] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState('')

  // New category form
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('Package')
  const [newCatColor, setNewCatColor] = useState('#64748b')

  function openProfileSheet() {
    setDisplayName(profile?.display_name ?? '')
    setMonthlyIncome(profile?.monthly_income?.toString() ?? '')
    setProfileSheet(true)
  }

  function saveProfile() {
    const income = parseAmountString(monthlyIncome) ?? 0
    updateProfile({ display_name: displayName, monthly_income: income })
    setProfileSheet(false)
  }

  function saveCategory() {
    if (!newCatName.trim()) { toast.error('Nama kategori wajib diisi'); return }
    addCategory({ name: newCatName.trim(), icon: newCatIcon, color: newCatColor })
    setNewCatName('')
    setCatSheet(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (isLoading) {
    return <div className="space-y-4 pt-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
  }

  return (
    <div className="space-y-5 pt-2 pb-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
      </div>

      {/* Profile card */}
      <div className="flex items-center gap-4 p-4 bg-bg-card rounded-2xl border border-border">
        <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center text-xl font-bold text-accent-purple">
          {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-text-primary">{profile?.display_name ?? '—'}</p>
          <p className="text-xs text-text-muted mt-0.5">
            Budget Navigator
          </p>
        </div>
        <TrendingUp className="w-5 h-5 text-accent-green" />
      </div>

      {/* Menu sections */}
      <div id="tour-settings-profile">
        <p className="text-xs text-text-muted font-semibold uppercase tracking-widest mb-2 px-1">Akun</p>
        <Card className="divide-y divide-border p-0 overflow-hidden">
          <button onClick={openProfileSheet} className="w-full flex items-center gap-3 px-4 py-3.5 tap-highlight">
            <div className="w-8 h-8 rounded-xl bg-accent-blue/15 flex items-center justify-center">
              <User className="w-4 h-4 text-accent-blue" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-text-primary">Profil & Nama</p>
              <p className="text-xs text-text-muted">{profile?.display_name}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
          <button onClick={openProfileSheet} className="w-full flex items-center gap-3 px-4 py-3.5 tap-highlight">
            <div className="w-8 h-8 rounded-xl bg-accent-green/15 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-accent-green" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-text-primary">Uang Bulanan</p>
              <p className="text-xs text-text-muted">
                {profile?.monthly_income ? formatCurrency(profile.monthly_income) : 'Belum diset'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs text-text-muted font-semibold uppercase tracking-widest">Kategori</p>
          <button onClick={() => setCatSheet(true)} className="flex items-center gap-1 text-xs text-accent-green font-medium">
            <Plus className="w-3 h-3" /> Tambah
          </button>
        </div>
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}22` }}>
                  <DynamicIcon name={cat.icon} className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <span className="text-sm text-text-primary flex-1">{cat.name}</span>
                {cat.is_default ? (
                  <span className="text-xs text-text-muted bg-bg-elevated px-2 py-0.5 rounded-full">Default</span>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus kategori "${cat.name}"?`)) {
                        deleteCategory(cat.id)
                      }
                    }}
                    className="w-7 h-7 rounded-lg bg-accent-red/10 flex items-center justify-center text-accent-red hover:bg-accent-red/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bantuan */}
      <div>
        <p className="text-xs text-text-muted font-semibold uppercase tracking-widest mb-2 px-1">Bantuan</p>
        <Card className="p-0 overflow-hidden">
          <button
            onClick={() => {
              localStorage.removeItem('gsav_has_seen_tour')
              router.push('/dashboard')
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 tap-highlight"
          >
            <div className="w-8 h-8 rounded-xl bg-accent-amber/15 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-accent-amber" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-text-primary">Mulai Ulang Tutorial</p>
              <p className="text-xs text-text-muted">Pelajari kembali fitur-fitur utama GSAV</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
        </Card>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-accent-red/10 border border-accent-red/20 rounded-2xl text-accent-red tap-highlight"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Keluar</span>
      </button>

      {/* Profile Edit Sheet */}
      <BottomSheet open={profileSheet} onClose={() => setProfileSheet(false)} title="Edit Profil">
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-text-secondary font-medium mb-2 block">Nama</label>
            <input
              id="settings-display-name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Nama kamu"
              className="w-full px-4 py-3.5 bg-bg-surface border border-border rounded-2xl text-text-primary text-sm focus:border-accent-green/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary font-medium mb-2 block">Uang Bulanan / Sangu</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">Rp</span>
              <input
                id="settings-monthly-income"
                type="number"
                inputMode="numeric"
                value={monthlyIncome}
                onChange={e => setMonthlyIncome(e.target.value)}
                placeholder="1500000"
                className="w-full pl-10 pr-4 py-3.5 bg-bg-surface border border-border rounded-2xl text-text-primary text-lg font-semibold mono-number focus:border-accent-green/50 transition-all"
              />
            </div>
          </div>
          <button onClick={saveProfile} disabled={isSaving} className="w-full py-4 bg-accent-green text-bg-primary font-semibold rounded-2xl active:scale-95 transition-all disabled:opacity-40">
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </BottomSheet>

      {/* Add Category Sheet */}
      <BottomSheet open={catSheet} onClose={() => setCatSheet(false)} title="Tambah Kategori">
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-text-secondary font-medium mb-2 block">Nama Kategori</label>
            <input
              id="new-category-name"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="Contoh: Kesehatan"
              className="w-full px-4 py-3.5 bg-bg-surface border border-border rounded-2xl text-text-primary text-sm focus:border-accent-green/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary font-medium mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewCatIcon(icon)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${newCatIcon === icon ? 'bg-accent-green/20 border border-accent-green text-accent-green' : 'bg-bg-surface border border-border text-text-secondary hover:text-text-primary'}`}
                >
                  <DynamicIcon name={icon} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-text-secondary font-medium mb-2 block">Warna</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewCatColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${newCatColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <button onClick={saveCategory} disabled={isAddingCat} className="w-full py-4 bg-accent-green text-bg-primary font-semibold rounded-2xl active:scale-95 transition-all disabled:opacity-40">
            {isAddingCat ? 'Menyimpan...' : 'Tambah Kategori'}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
