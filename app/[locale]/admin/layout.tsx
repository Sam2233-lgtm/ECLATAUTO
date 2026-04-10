// This layout is intentionally minimal.
// Auth protection is handled in AdminShell used by each protected page.
// The login page at /admin/login uses this layout but doesn't need protection.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <>{children}</>;
}
