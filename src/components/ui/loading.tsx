'use client'

import { Loader2 } from 'lucide-react'

interface LoadingProps {
  text?: string
}

export function Loading({ text = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  )
} 