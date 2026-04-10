import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import SupplementsManager from '@/components/admin/SupplementsManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: 'Suppléments — Admin Éclat Auto' };
}

export default async function AdminSupplementsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const supplements = await prisma.supplement.findMany({ orderBy: { order: 'asc' } });

  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-cream">Suppléments</h1>
        <p className="text-brand-cream-muted mt-1">
          {supplements.length} supplément{supplements.length !== 1 ? 's' : ''} — options additionnelles proposées lors de la réservation
        </p>
      </div>
      <SupplementsManager initialSupplements={supplements} />
    </AdminShell>
  );
}
