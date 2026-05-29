'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function AnimatedCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      className={cn('glass rounded-[2rem] p-6', className)}
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      {children}
    </motion.div>
  )
}
