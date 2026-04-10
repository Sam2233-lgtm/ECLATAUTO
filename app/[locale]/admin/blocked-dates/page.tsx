import { setRequestLocale } from 'next-intl/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import BlockedDatesManager from '@/components/admin/BlockedDatesManager';

export async function generateMetadata() {
  return { title: 'Dates bloquées — Admin Éclat Auto' };
}

export default async function BlockedDatesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const blocked = await prisma.blockedDate.findMany({ orderBy: { date: 'asc' } });
  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-cream">Dates bloquées</h1>
        <p className="text-brand-cream-muted mt-1">Gérez les dates et créneaux indisponibles pour les réservations</p>
      </div>
      <BlockedDatesManager initialBlocked={blocked} />
    </AdminShell>
  );
}
