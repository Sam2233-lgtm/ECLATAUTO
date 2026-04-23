export const dynamic = 'force-dynamic';
import AdminShell from '@/components/admin/AdminShell';
import MaintenancePlansManager from '@/components/admin/MaintenancePlansManager';
import { prisma } from '@/lib/prisma';

interface Props {
  params: { locale: string };
}

export async function generateMetadata() {
  return { title: 'Forfaits Maintien — Admin Éclat Auto' };
}

export default async function MaintenancePlansPage({ params: { locale } }: Props) {
  const plans = await prisma.maintenancePlan.findMany({ orderBy: { order: 'asc' } });

  const typed = plans.map((p) => ({
    ...p,
    features: p.features as string[],
  }));

  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-cream">Forfaits Maintien</h1>
        <p className="text-brand-cream-muted text-sm mt-1">
          Gérez les forfaits de maintien affichés sur /maintien.
        </p>
      </div>
      <MaintenancePlansManager plans={typed} />
    </AdminShell>
  );
}
