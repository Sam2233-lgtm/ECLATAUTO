import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminNav from './AdminNav';

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
    <div className="min-h-screen bg-brand-black flex">
      <AdminNav locale={locale} session={session} />
      <div className="flex-1 ml-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
