import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import WhyUs from '@/components/home/WhyUs';
import Process from '@/components/home/Process';
import Gallery from '@/components/home/Gallery';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import ContactCTA from '@/components/home/ContactCTA';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: HomePageProps) {
  return {
    title:
      locale === 'fr'
        ? 'Éclat Auto — Détailing automobile à domicile au Québec'
        : 'Éclat Auto — Mobile Auto Detailing in Quebec',
  };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-brand-black">
      <Header locale={locale} />
      <main>
        <Hero locale={locale} />
        <Services locale={locale} />
        <WhyUs />
        <Process />
        <Gallery locale={locale} />
        <Testimonials locale={locale} />
        <FAQ locale={locale} />
        <ContactCTA />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
