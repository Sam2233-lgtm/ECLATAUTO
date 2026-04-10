import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import ReservationsTable from '@/components/admin/ReservationsTable';

interface ReservationsPageProps {
  params: { locale: string };
  searchParams: { status?: string };
}

export async function generateMetadata() {
  return { title: 'Réservations — Admin Éclat Auto' };
}

export default async function ReservationsPage({
  params: { locale },
  searchParams,
}: ReservationsPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations('admin.reservations');

  const statusFilter = searchParams.status;
  const reservations = await prisma.reservation.findMany({
    where: statusFilter && statusFilter !== 'all' ? { status: statusFilter } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-cream">{t('title')}</h1>
        <p className="text-brand-cream-muted mt-1">
          {reservations.length} réservation{reservations.length !== 1 ? 's' : ''}
        </p>
      </div>

      <ReservationsTable
        reservations={reservations}
        locale={locale}
        activeStatus={statusFilter || 'all'}
      />
    </AdminShell>
  );
}
