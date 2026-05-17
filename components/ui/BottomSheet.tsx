'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className={cn(
              'fixed bottom-0 left-0 right-0 z-[200]',
              'bg-bg-elevated rounded-t-3xl border-t border-border',
              'max-h-[90dvh] flex flex-col',
              className
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border-strong" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
                <h2 className="text-base font-semibold text-text-primary">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content — scrollable */}
            <div className="px-5 pb-[max(env(safe-area-inset-bottom),48px)] overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
