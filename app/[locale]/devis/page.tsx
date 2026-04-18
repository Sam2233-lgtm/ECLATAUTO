import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DevisForm from './DevisForm';

export const revalidate = 300;

interface DevisPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: DevisPageProps) {
  return {
    title: locale === 'fr' ? 'Demande de devis — Éclat Auto' : 'Request a Quote — Éclat Auto',
    description: locale === 'fr'
      ? 'Obtenez une soumission gratuite pour votre service de détailing automobile. Réponse sous 24h.'
      : 'Get a free quote for your auto detailing service. Response within 24 hours.',
  };
}

export default function DevisPage({ params: { locale } }: DevisPageProps) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-brand-black">
      <Header locale={locale} />
      <main className="pt-20">
        <div className="py-16 px-4">
          <div className="text-center mb-12">
            <span className="text-brand-gold text-sm font-semibold uppercase tracking-widest">
              {locale === 'fr' ? 'Soumission gratuite' : 'Free estimate'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-cream mt-2">
              {locale === 'fr' ? 'Demandez votre devis' : 'Request a Quote'}
            </h1>
            <div className="gold-divider" />
            <p className="text-brand-cream-muted max-w-xl mx-auto">
              {locale === 'fr'
                ? 'Pour les services personnalisés ou les situations particulières, envoyez-nous votre demande et nous vous répondrons sous 24h.'
                : 'For custom services or special situations, send us your request and we will respond within 24 hours.'}
            </p>
          </div>
          <DevisForm locale={locale} />
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
