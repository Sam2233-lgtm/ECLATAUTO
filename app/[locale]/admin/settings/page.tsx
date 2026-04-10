import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: 'Paramètres — Admin Éclat Auto' };
}

export default async function AdminSettingsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });

  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-cream">Paramètres du site</h1>
        <p className="text-brand-cream-muted mt-1">Coordonnées, réseaux sociaux, disponibilité et sécurité</p>
      </div>
      <SettingsForm initialSettings={settings} />
    </AdminShell>
  );
}
