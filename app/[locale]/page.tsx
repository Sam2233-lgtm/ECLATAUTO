import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/home/Hero';
import ServiceCardsSection from '@/components/home/ServiceCardsSection';
import WhyUs from '@/components/home/WhyUs';
import Process from '@/components/home/Process';
import Gallery from '@/components/home/Gallery';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import ContactCTA from '@/components/home/ContactCTA';
import { getSiteSettings } from '@/lib/db-services';

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

interface HomePageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: HomePageProps) {
  return {
    title:
      locale === 'fr'
        ? 'Éclat Auto — Détailing automobile à domicile au Québec'
        : 'Éclat Auto — Mobile Auto Detailing in Quebec',
    description:
      locale === 'fr'
        ? 'Service de détailing automobile professionnel à domicile au Québec. Lavage, shampooing, décontamination et protection peinture.'
        : 'Professional mobile auto detailing service in Quebec. Wash, shampoo, decontamination and paint protection.',
  };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  setRequestLocale(locale);
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-brand-black">
      <Header locale={locale} />
      <main>
        <Hero locale={locale} settings={settings} />
        <ServiceCardsSection locale={locale} />
        <WhyUs />
        <Process />
        <Gallery locale={locale} />
        <Testimonials locale={locale} />
        <FAQ locale={locale} />
        <ContactCTA phone={settings.phone || '438-493-1451'} email={settings.email || 'eclatautoqc@gmail.com'} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
