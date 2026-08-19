// components/ui/toast/types.ts

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number // in ms
  autoDismiss?: boolean
  showProgress?: boolean
}

export interface ToastOptions {
  title?: string
  duration?: number
  autoDismiss?: boolean
  showProgress?: boolean
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (type: ToastType, message: string, options?: ToastOptions) => string
  removeToast: (id: string) => void
  dismissAll: () => void
}