import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminLayoutClient from './AdminLayoutClient';

interface AdminShellProps {
  locale: string;
  children: React.ReactNode;
}

export default async function AdminShell({ locale, children }: AdminShellProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <AdminLayoutClient locale={locale} session={session}>
      {children}
    </AdminLayoutClient>
  );
}
