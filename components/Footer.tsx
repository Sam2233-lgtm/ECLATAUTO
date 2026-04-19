import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';
import { getSiteSettings } from '@/lib/db-services';

interface FooterProps {
  locale: string;
}

export default async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const settings = await getSiteSettings();

  const serviceLinks = [
    { nameFr: 'Lavage extérieur de base', nameEn: 'Basic Exterior Wash' },
    { nameFr: 'Lavage extérieur + intérieur', nameEn: 'Exterior + Interior Wash' },
    { nameFr: 'Shampooing sièges et tapis', nameEn: 'Seat & Carpet Shampoo' },
    { nameFr: 'Décontamination', nameEn: 'Decontamination' },
    { nameFr: 'Protection peinture', nameEn: 'Paint Protection' },
  ];

  return (
    <footer className="bg-brand-black border-t border-brand-black-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">

        {/* Top — brand + nav */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 pb-12 border-b border-brand-black-border">

          {/* Brand */}
          <div className="max-w-xs">
            <Link href={`/${locale}`} className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-brand-gold flex items-center justify-center flex-shrink-0">
                <span className="font-display text-brand-black text-lg leading-none">É</span>
              </div>
              <span className="font-display text-xl tracking-wide">
                <span className="text-brand-gold">Éclat</span>
                <span className="text-brand-cream"> Auto</span>
              </span>
            </Link>
            <p className="text-brand-cream-muted/60 text-xs leading-relaxed font-light">
              {t('tagline')}
            </p>
          </div>

          {/* Nav grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-8">
            <div>
              <div className="eyebrow mb-4">{t('services')}</div>
              <ul className="space-y-2.5">
                {serviceLinks.map((s) => (
                  <li key={s.nameFr}>
                    <Link href={`/${locale}/reservation`} className="text-brand-cream-muted/60 hover:text-brand-gold text-xs font-sans transition-colors">
                      {locale === 'fr' ? s.nameFr : s.nameEn}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="eyebrow mb-4">{t('company')}</div>
              <ul className="space-y-2.5">
                <li><Link href={`/${locale}#why-us`} className="text-brand-cream-muted/60 hover:text-brand-gold text-xs font-sans transition-colors">{t('about')}</Link></li>
                <li><Link href={`/${locale}#contact`} className="text-brand-cream-muted/60 hover:text-brand-gold text-xs font-sans transition-colors">{t('contact')}</Link></li>
                <li><Link href={`/${locale}/reservation`} className="text-brand-cream-muted/60 hover:text-brand-gold text-xs font-sans transition-colors">{tNav('reservation')}</Link></li>
              </ul>
            </div>

            <div>
              <div className="eyebrow mb-4">{t('contact')}</div>
              <ul className="space-y-2.5">
                <li>
                  <a href={`tel:${(settings.phone || '').replace(/\s/g, '')}`} className="text-brand-cream-muted/60 hover:text-brand-gold text-xs font-sans transition-colors">
                    {settings.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${settings.email}`} className="text-brand-cream-muted/60 hover:text-brand-gold text-xs font-sans transition-colors">
                    {settings.email}
                  </a>
                </li>
                <li className="text-brand-cream-muted/40 text-xs font-sans">Grand Montréal & Laval</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-brand-cream-muted/30 text-[10px] font-sans uppercase tracking-widest">
            © {new Date().getFullYear()} Éclat Auto — {t('rights')}
          </p>
          <div className="flex items-center gap-6">
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                className="text-brand-cream-muted/30 hover:text-brand-gold text-[10px] font-sans uppercase tracking-widest transition-colors">
                Instagram
              </a>
            )}
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                className="text-brand-cream-muted/30 hover:text-brand-gold text-[10px] font-sans uppercase tracking-widest transition-colors">
                Facebook
              </a>
            )}
            <Link href="#" className="text-brand-cream-muted/30 hover:text-brand-cream-muted text-[10px] font-sans uppercase tracking-widest transition-colors">{t('privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
