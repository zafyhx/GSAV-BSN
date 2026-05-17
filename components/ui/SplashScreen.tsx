'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export function SplashScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Only show splash screen once per session
    const hasShown = sessionStorage.getItem('splash_shown')
    if (hasShown) {
      setShow(false)
      return
    }

    sessionStorage.setItem('splash_shown', 'true')
    
    // Hide after 1.5 seconds
    const timer = setTimeout(() => {
      setShow(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  // If not showing, render nothing to avoid layout shifts
  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-bg-primary"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          >
            <Image 
              src="/logo.png" 
              alt="GSAV Logo" 
              width={280} 
              height={140} 
              priority
              className="object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
