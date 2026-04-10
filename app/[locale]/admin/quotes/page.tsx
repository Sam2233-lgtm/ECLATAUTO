import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import QuotesManager from '@/components/admin/QuotesManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: 'Demandes de devis — Admin Éclat Auto' };
}

export default async function AdminQuotesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const rawQuotes = await prisma.quote.findMany({ orderBy: { createdAt: 'desc' } });
  const quotes = rawQuotes.map((q) => ({
    ...q,
    photoUrls: (q.photoUrls as string[] | null) ?? null,
    createdAt: q.createdAt.toISOString(),
  }));

  const pending = quotes.filter((q) => q.status === 'pending').length;

  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-cream">Demandes de devis</h1>
        <p className="text-brand-cream-muted mt-1">
          {quotes.length} demande{quotes.length !== 1 ? 's' : ''} au total
          {pending > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs rounded-full">
              {pending} en attente
            </span>
          )}
        </p>
      </div>
      <QuotesManager initialQuotes={quotes} />
    </AdminShell>
  );
}
