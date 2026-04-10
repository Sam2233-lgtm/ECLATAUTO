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
  const [reservations, services] = await Promise.all([
    prisma.reservation.findMany({
      where: statusFilter && statusFilter !== 'all' ? { status: statusFilter } : undefined,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.service.findMany({ select: { id: true, nameFr: true, nameEn: true }, orderBy: { order: 'asc' } }),
  ]);

  // Build service name map: id → name
  const serviceNames: Record<string, string> = {};
  for (const s of services) {
    serviceNames[s.id] = locale === 'en' ? s.nameEn : s.nameFr;
  }

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
        serviceNames={serviceNames}
      />
    </AdminShell>
  );
}
