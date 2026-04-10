import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import PromotionsManager from '@/components/admin/PromotionsManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: 'Promotions — Admin Éclat Auto' };
}

export default async function AdminPromotionsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  const [promotions, services] = await Promise.all([
    prisma.promotion.findMany({
      include: { services: { include: { service: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.service.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  ]);

  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-cream">Promotions</h1>
        <p className="text-brand-cream-muted mt-1">{promotions.length} promotion{promotions.length !== 1 ? 's' : ''}</p>
      </div>
      <PromotionsManager initialPromotions={promotions} availableServices={services} />
    </AdminShell>
  );
}
