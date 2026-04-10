import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import ServicesManager from '@/components/admin/ServicesManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: 'Services — Admin Éclat Auto' };
}

export default async function AdminServicesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const rawServices = await prisma.service.findMany({ orderBy: { order: 'asc' } });
  const services = rawServices.map((s) => ({
    ...s,
    pricing: (s.pricing as Record<string, number> | null) ?? null,
  }));

  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-cream">Services</h1>
        <p className="text-brand-cream-muted mt-1">{services.length} service{services.length !== 1 ? 's' : ''} configuré{services.length !== 1 ? 's' : ''}</p>
      </div>
      <ServicesManager initialServices={services} />
    </AdminShell>
  );
}
