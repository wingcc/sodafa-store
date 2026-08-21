// app/(auth)/layout.tsx
// Minimal layout for auth pages (login, register, etc.)
// Uses only the global CSS — no website or dashboard styles.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="ltr" lang="en" className="min-h-screen">
      {children}
    </div>
  );
}