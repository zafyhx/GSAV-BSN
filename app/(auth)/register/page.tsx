'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Akun berhasil dibuat! 🎉')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <Image 
          src="/icons/icon-192.png" 
          alt="GSAV Logo" 
          width={64} 
          height={64} 
          className="rounded-2xl shadow-lg shadow-accent-green/20"
          priority
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">GSAV</h1>
          <p className="text-sm text-text-secondary mt-0.5">Budget Spending Navigator</p>
        </div>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm">
        

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-text-secondary font-medium" htmlFor="displayName">
              Nama Kamu
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              placeholder="Budi, Sari, dll."
              className="w-full px-4 py-3.5 bg-bg-surface border border-border rounded-2xl text-text-primary placeholder:text-text-muted text-sm focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/30 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-text-secondary font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="nama@email.com"
              className="w-full px-4 py-3.5 bg-bg-surface border border-border rounded-2xl text-text-primary placeholder:text-text-muted text-sm focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/30 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-text-secondary font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Min. 6 karakter"
                className="w-full px-4 py-3.5 bg-bg-surface border border-border rounded-2xl text-text-primary placeholder:text-text-muted text-sm focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/30 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-accent-green text-bg-primary font-semibold rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
          >
            {loading ? 'Membuat akun...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-accent-green font-medium hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
