import * as React from 'react'
import { cn } from '@/lib/utils'

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold text-lavender-600 shadow-sm backdrop-blur-xl', className)} {...props} />
}
