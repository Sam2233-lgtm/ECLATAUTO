// Login page doesn't need the admin layout (no sidebar, no auth check)
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
