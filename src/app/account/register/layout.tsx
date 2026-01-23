export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No auth check - allow unauthenticated access
  return <>{children}</>
}

