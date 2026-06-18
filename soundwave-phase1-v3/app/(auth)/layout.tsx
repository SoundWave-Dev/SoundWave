// Auth pages don't use the main app shell (no sidebar, no player)
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
