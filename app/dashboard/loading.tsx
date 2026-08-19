// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at top, var(--color-mediumGreen), var(--color-darkGreen))`,
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
        style={{ borderColor: 'var(--color-gold)' }}
      />
    </div>
  )
}