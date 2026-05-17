'use client'

import { useEffect, useState } from 'react'
import { driver, Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useRouter, usePathname } from 'next/navigation'

const waitForElement = (selector: string): Promise<void> => {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve()
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        resolve()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })
}

export function AppTour() {
  const [isMounted, setIsMounted] = useState(false)
  const [isTourActive, setIsTourActive] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    if (pathname !== '/dashboard') return
    if (isTourActive) return

    const hasSeenTour = localStorage.getItem('gsav_has_seen_tour')
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsTourActive(true)
        startTour()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isMounted, pathname, isTourActive])

  const handleNextRoute = async (path: string, selector: string, driverObj: Driver) => {
    router.push(path)
    await waitForElement(selector)
    driverObj.moveNext()
  }

  const handlePrevRoute = async (path: string, selector: string, driverObj: Driver) => {
    router.push(path)
    await waitForElement(selector)
    driverObj.movePrevious()
  }

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      popoverClass: 'driverjs-theme',
      nextBtnText: 'Lanjut',
      prevBtnText: 'Kembali',
      doneBtnText: 'Selesai',
      allowClose: false, // Prevent accidental close during transitions
      onDestroyStarted: () => {
        if (!driverObj.hasNextStep() || confirm('Yakin ingin melewati tutorial ini?')) {
          localStorage.setItem('gsav_has_seen_tour', 'true')
          driverObj.destroy()
          setIsTourActive(false)
        }
      },
      steps: [
        {
          element: '#tour-header',
          popover: { title: 'Selamat Datang di GSAV', description: 'Aplikasi pencatat keuangan pintar yang didesain khusus agar pengeluaranmu lebih terukur dan tidak bocor.', side: 'bottom', align: 'start' }
        },
        {
          element: '#tour-balance',
          popover: { title: 'Saldo dan Pengeluaran', description: 'Lihat sisa saldo dan total pengeluaranmu bulan ini dalam satu lirikan.', side: 'bottom', align: 'center' }
        },
        {
          element: '#tour-burn-rate',
          popover: { title: 'Burn Rate', description: 'Fitur unik GSAV yang memprediksi kapan uangmu akan habis berdasarkan kecepatan jajanmu saat ini!', side: 'bottom', align: 'center' }
        },
        {
          element: '#tour-quick-add',
          popover: { title: 'Quick Add', description: 'Ketik langsung transaksimu! Contoh: "makan 20k". Sistem akan otomatis mengenali angka dan kategorinya.', side: 'bottom', align: 'center' }
        },
        {
          element: '#fab-add-transaction',
          popover: { title: 'Catatan Detail', description: 'Jika butuh mencatat dengan lebih lengkap (tanggal, catatan), gunakan tombol Plus ini.', side: 'top', align: 'end' }
        },
        {
          element: '#tour-nav-transactions',
          popover: { 
            title: 'Riwayat Transaksi', 
            description: 'Sekarang, mari kita pindah ke tab Transaksi.', 
            side: 'top', align: 'center',
            onNextClick: (_, __, { driver }) => handleNextRoute('/transactions', '#tour-filter-transaction', driver)
          }
        },
        {
          element: '#tour-filter-transaction',
          popover: { 
            title: 'Pencarian & Filter', 
            description: 'Di sini, kamu bisa mencari catatan lama atau mem-filter berdasarkan Pemasukan/Pengeluaran.', 
            side: 'bottom', align: 'center',
            onPrevClick: (_, __, { driver }) => handlePrevRoute('/dashboard', '#tour-nav-transactions', driver)
          }
        },
        {
          element: '#tour-nav-analytics',
          popover: { 
            title: 'Analitik Keuangan', 
            description: 'Selanjutnya, mari lihat laporan keuanganmu.', 
            side: 'top', align: 'center',
            onNextClick: (_, __, { driver }) => handleNextRoute('/analytics', '#tour-chart-analytics', driver)
          }
        },
        {
          element: '#tour-chart-analytics',
          popover: { 
            title: 'Ringkasan Cerdas', 
            description: 'Pantau rata-rata pengeluaran harian dan ketahui kategori apa yang paling boros bulan ini.', 
            side: 'bottom', align: 'center',
            onPrevClick: (_, __, { driver }) => handlePrevRoute('/transactions', '#tour-nav-analytics', driver)
          }
        },
        {
          element: '#tour-nav-budget',
          popover: { 
            title: 'Target Budget', 
            description: 'Terakhir, mari kita atur batasan jajanmu.', 
            side: 'top', align: 'center',
            onNextClick: (_, __, { driver }) => handleNextRoute('/budget', '#tour-budget-list', driver)
          }
        },
        {
          element: '#tour-budget-list',
          popover: { 
            title: 'Kontrol Pengeluaran', 
            description: 'Set budget per kategori. Bar akan memerah jika pengeluaranmu sudah mendekati batas agar kamu tidak kebablasan.', 
            side: 'bottom', align: 'center',
            onPrevClick: (_, __, { driver }) => handlePrevRoute('/analytics', '#tour-nav-budget', driver)
          }
        },
        {
          element: '#tour-nav-home',
          popover: {
            title: 'Kembali ke Dashboard',
            description: 'Mari kembali ke halaman utama untuk melihat pengaturan akun.',
            side: 'top', align: 'center',
            onNextClick: (_, __, { driver }) => handleNextRoute('/dashboard', '#tour-profile-settings', driver)
          }
        },
        {
          element: '#tour-profile-settings',
          popover: { 
            title: 'Profil dan Kategori', 
            description: 'Klik profilmu di pojok atas untuk masuk ke menu Settings.', 
            side: 'bottom', align: 'end',
            onNextClick: (_, __, { driver }) => handleNextRoute('/settings', '#tour-settings-profile', driver),
            onPrevClick: (_, __, { driver }) => handlePrevRoute('/budget', '#tour-nav-home', driver)
          }
        },
        {
          element: '#tour-settings-profile',
          popover: { 
            title: 'Kustomisasi Penuh', 
            description: 'Di sini, kamu bisa menambah, mengedit icon, dan menghapus kategori sesuai kebutuhanmu. Selesai!', 
            side: 'bottom', align: 'center',
            onPrevClick: (_, __, { driver }) => handlePrevRoute('/dashboard', '#tour-profile-settings', driver)
          }
        }
      ]
    })

    driverObj.drive()
  }

  if (!isMounted) return null

  return null
}
