// components/ui/toast/Toast.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { X } from 'lucide-react'
import { Toast as ToastType } from './types'

const iconMap = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
}

const borderColorMap = {
  success: 'border-l-8 border-green-500',
  error: 'border-l-8 border-red-500',
  warning: 'border-l-8 border-yellow-500',
  info: 'border-l-8 border-blue-500',
}

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const progressRef = useRef<number>(100)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const duration = toast.duration || 4000
  const autoDismiss = toast.autoDismiss !== false
  const showProgress = toast.showProgress !== false

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })

    if (autoDismiss) {
      startTimeRef.current = performance.now()

      const updateProgress = () => {
        const elapsed = performance.now() - startTimeRef.current
        const remaining = Math.max(0, 1 - elapsed / duration)
        progressRef.current = remaining * 100
        setProgress(progressRef.current)

        if (remaining > 0) {
          animationRef.current = requestAnimationFrame(updateProgress)
        } else {
          // Auto dismiss
          handleRemove()
        }
      }

      animationRef.current = requestAnimationFrame(updateProgress)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300) // match transition duration
  }

  return (
    <div
      className={`
        relative w-full bg-white  rounded-lg shadow-lg overflow-hidden
        grid grid-cols-[auto,1fr,auto] items-center gap-3 px-4 py-3
        transition-all duration-300 ease-out
        ${borderColorMap[toast.type]}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      {/* Icon */}
      <div className={`text-2xl ${iconColorMap[toast.type]} font-semibold text-gray-900   text-sm`}>
        {iconMap[toast.type]}
        {toast.title}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-gray-500   text-xs">
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={handleRemove}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      {showProgress && autoDismiss && (
        <div
          className="absolute bottom-0 left-0 h-1 transition-width duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            backgroundColor: borderColorMap[toast.type].replace('border-l-8 border-', ''),
          }}
        />
      )}
    </div>
  )
}