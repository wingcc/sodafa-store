Documentation: How to Use
Basic Usage
tsx
'use client'
import { useToast } from '@/components/ui/toast'

function MyComponent() {
  const toast = useToast()

  const showSuccess = () => {
    toast.addToast('success', 'Operation completed successfully')
  }

  const showError = () => {
    toast.addToast('error', 'Something went wrong')
  }

  return (
    <button onClick={showSuccess}>Show Success</button>
  )
}
With Custom Title
tsx
toast.addToast('warning', 'Your session will expire soon', {
  title: '⚠️ Session Warning',
  duration: 6000, // 6 seconds
})
Disable Auto-Dismiss & Progress Bar
tsx
toast.addToast('info', 'Please confirm your email', {
  autoDismiss: false,
  showProgress: false,
})
Dismiss All
tsx
toast.dismissAll()
🎨 Design Consistency
The toast component uses the exact same design as your original HTML:

✅ Left border with color (green, red, yellow, blue)

✅ Emoji icons (or you can switch to Lucide icons)

✅ Bold title + light message

✅ Close button (×)

✅ Progress bar at bottom

✅ Slide-in from right animation

✅ Responsive on mobile

