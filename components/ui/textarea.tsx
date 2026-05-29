import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return <textarea className={cn('admin-field min-h-[150px] w-full resize-y', className)} ref={ref} {...props} />
})
Textarea.displayName = 'Textarea'

export { Textarea }
