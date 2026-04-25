import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { QrCode } from 'lucide-react';
import QRCodeDisplay from '@/components/admin/QRCodeDisplay';

export const dynamic = 'force-dynamic';

interface Props {
  params: { locale: string };
}

export default async function QRCodePage({ params: { locale } }: Props) {
  const session = await getAdminSession();
  if (!session) redirect(`/${locale}/admin/login`);

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <QrCode className="w-6 h-6 text-brand-gold" />
        <h1 className="text-2xl font-bold text-brand-cream">
          {locale === 'fr' ? 'Code QR — Réservation' : 'QR Code — Booking'}
        </h1>
      </div>
      <p className="text-brand-cream-muted text-sm mb-8">
        {locale === 'fr'
          ? 'Scanne ce code pour aller directement à la page de réservation.'
          : 'Scan this code to go directly to the booking page.'}
      </p>

      <QRCodeDisplay locale={locale} />
    </div>
  );
}
