import { BottomNav } from '@/components/shared/BottomNav'
import { FAB } from '@/components/shared/FAB'
import { AppTour } from '@/components/ui/AppTour'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-container">
      <AppTour />
      <main className="safe-top safe-bottom px-4">
        {children}
      </main>
      <FAB />
      <BottomNav />
    </div>
  )
}
