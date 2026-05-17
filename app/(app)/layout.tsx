import { BottomNav } from '@/components/shared/BottomNav'
import { FAB } from '@/components/shared/FAB'
import { AppTour } from '@/components/ui/AppTour'
import { TourProvider } from '@/lib/context/TourContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider>
      <div className="page-container">
        <AppTour />
        <main className="safe-top safe-bottom px-4">
          {children}
        </main>
        <FAB />
        <BottomNav />
      </div>
    </TourProvider>
  )
}
