import { setRequestLocale } from 'next-intl/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import ContentManager from '@/components/admin/ContentManager';

export async function generateMetadata() {
  return { title: 'Contenu — Admin Éclat Auto' };
}

export default async function ContentPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [settings, testimonials, faqs] = await Promise.all([
    prisma.siteSettings.upsert({ where: { id: 'singleton' }, update: {}, create: { id: 'singleton' } }),
    prisma.testimonial.findMany({ orderBy: { order: 'asc' } }),
    prisma.fAQ.findMany({ orderBy: { order: 'asc' } }),
  ]);

  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-cream">Gestion du contenu</h1>
        <p className="text-brand-cream-muted mt-1">Hero, témoignages et FAQ</p>
      </div>
      <ContentManager settings={settings} testimonials={testimonials} faqs={faqs} />
    </AdminShell>
  );
}
