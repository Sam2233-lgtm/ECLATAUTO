import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import VehicleCategoriesManager from '@/components/admin/VehicleCategoriesManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: 'Catégories de véhicules — Admin Éclat Auto' };
}

export default async function VehicleCategoriesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const categories = await prisma.vehicleCategory.findMany({ orderBy: { order: 'asc' } });

  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-cream">Catégories de véhicules</h1>
        <p className="text-brand-cream-muted mt-1">
          {categories.length} catégorie{categories.length !== 1 ? 's' : ''} — définissez les types de véhicules acceptés
        </p>
      </div>
      <VehicleCategoriesManager initialCategories={categories} />
    </AdminShell>
  );
}
