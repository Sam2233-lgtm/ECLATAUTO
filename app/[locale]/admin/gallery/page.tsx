import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import AdminShell from '@/components/admin/AdminShell';
import GalleryManager from '@/components/admin/GalleryManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: 'Galerie — Admin Éclat Auto' };
}

export default async function AdminGalleryPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const photos = await prisma.photo.findMany({ orderBy: { order: 'asc' } });

  return (
    <AdminShell locale={locale}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-cream">Galerie</h1>
        <p className="text-brand-cream-muted mt-1">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
      </div>
      <GalleryManager initialPhotos={photos} />
    </AdminShell>
  );
}
