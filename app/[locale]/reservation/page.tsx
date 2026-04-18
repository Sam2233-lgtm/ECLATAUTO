import { getTranslations, setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingWizard from '@/components/booking/BookingWizard';
import { getActiveServicesWithPromos } from '@/lib/db-services';
import { prisma } from '@/lib/prisma';

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

interface ReservationPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: ReservationPageProps) {
  return {
    title: locale === 'fr' ? 'Réservation — Éclat Auto' : 'Book Now — Éclat Auto',
  };
}

export default async function ReservationPage({ params: { locale } }: ReservationPageProps) {
  setRequestLocale(locale);
  const [services, categories] = await Promise.all([
    getActiveServicesWithPromos(),
    prisma.vehicleCategory.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  ]);

  return (
    <div className="min-h-screen bg-brand-black">
      <Header locale={locale} />
      <main className="pt-20">
        <div className="py-16 px-4">
          <div className="text-center mb-12">
            <span className="text-brand-gold text-sm font-semibold uppercase tracking-widest">
              {locale === 'fr' ? 'Service à domicile' : 'Mobile service'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-cream mt-2">
              {locale === 'fr' ? 'Réservez votre service' : 'Book Your Service'}
            </h1>
            <div className="gold-divider" />
          </div>
          <BookingWizard locale={locale} services={services} categories={categories} />
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
