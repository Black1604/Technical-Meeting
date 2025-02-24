'use client'

import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toastVariants = cva(
  'relative w-full rounded-lg p-4 shadow-lg transition-all',
  {
    variants: {
      type: {
        success: 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100',
        error: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
      },
    },
    defaultVariants: {
      type: 'success',
    },
  }
)

interface ToastProps extends VariantProps<typeof toastVariants> {
  message: string
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className={cn(toastVariants({ type }))}>
      <div className="flex items-start justify-between">
        <p className="text-sm">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-md hover:opacity-75"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
} 