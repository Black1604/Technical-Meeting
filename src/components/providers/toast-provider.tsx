'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { Toast } from '@/components/ui/toast'

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{
    id: number
    message: string
    type: 'success' | 'error'
  }>>([])

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => {
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
} 