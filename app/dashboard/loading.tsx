// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      style={{
        background: 'var(--dashboard-bg-dark, #0f1411)',
      }}
    >
      <div className="relative" style={{ width: 76, height: 76 }}>
        <div
          className="absolute inset-0 animate-spin rounded-full"
          style={{
            border: '3px solid color-mix(in srgb, var(--color-gold, #d97706) 25%, transparent)',
            borderTopColor: 'var(--color-gold, #d97706)',
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: 'var(--color-gold, #d97706)',
            fontSize: '1.6rem',
            fontWeight: 700,
          }}
        >
          ص
        </div>
      </div>
    </div>
  )
}