export const dynamic = 'force-dynamic';
import AdminShell from '@/components/admin/AdminShell';
import ServiceCardsManager from '@/components/admin/ServiceCardsManager';
import { prisma } from '@/lib/prisma';

interface Props {
  params: { locale: string };
}

export async function generateMetadata() {
  return { title: 'Services — Admin Éclat Auto' };
}

export default async function ServiceCardsPage({ params: { locale } }: Props) {
  const cards = await prisma.serviceCard.findMany({ orderBy: { order: 'asc' } });

  // Cast Json prices to typed object
  const typed = cards.map((c) => ({
    ...c,
    prices: c.prices as { berline: number; vus: number; pickup: number; fourgonnette: number },
  }));

  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-cream">Services</h1>
        <p className="text-brand-cream-muted text-sm mt-1">
          Modifiez les services affichés sur la page d'accueil.
        </p>
      </div>
      <ServiceCardsManager cards={typed} />
    </AdminShell>
  );
}
