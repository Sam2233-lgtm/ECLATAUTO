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
    <footer className="bg-brand-black-soft border-t border-brand-black-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-gold rounded-md flex items-center justify-center">
                <span className="text-brand-black font-black text-sm">É</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-brand-gold">Éclat</span>
                <span className="text-brand-cream"> Auto</span>
              </span>
            </Link>
            <p className="text-brand-cream-muted text-sm leading-relaxed mb-6">{t('tagline')}</p>
            <div className="flex gap-3">
              <a
                href={settings.instagramUrl || '#'}
                target={settings.instagramUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-brand-black-border flex items-center justify-center text-brand-cream-muted hover:text-brand-gold hover:border-brand-gold/40 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.facebookUrl || '#'}
                target={settings.facebookUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-brand-black-border flex items-center justify-center text-brand-cream-muted hover:text-brand-gold hover:border-brand-gold/40 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-brand-cream font-semibold mb-4">{t('services')}</h3>
            <ul className="space-y-2">
              {serviceLinks.map((s) => (
                <li key={s.nameFr}>
                  <Link href={`/${locale}/reservation`} className="text-brand-cream-muted hover:text-brand-gold text-sm transition-colors">
                    {locale === 'fr' ? s.nameFr : s.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-brand-cream font-semibold mb-4">{t('company')}</h3>
            <ul className="space-y-2">
              <li><Link href={`/${locale}#why-us`} className="text-brand-cream-muted hover:text-brand-gold text-sm transition-colors">{t('about')}</Link></li>
              <li><Link href={`/${locale}#contact`} className="text-brand-cream-muted hover:text-brand-gold text-sm transition-colors">{t('contact')}</Link></li>
              <li><Link href={`/${locale}/reservation`} className="text-brand-cream-muted hover:text-brand-gold text-sm transition-colors">{tNav('reservation')}</Link></li>
              {settings.instagramUrl && (
                <li><a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-brand-cream-muted hover:text-brand-gold text-sm transition-colors">Instagram</a></li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-brand-cream font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-brand-cream-muted">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-brand-cream-muted">
                <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span>{settings.email}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-brand-cream-muted">
                <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                <span>Grand Montréal & Laval, QC</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-brand-black-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-brand-cream-muted/50 text-xs">
            © {new Date().getFullYear()} Éclat Auto. {t('rights')}. {t('madeIn')} 🍁
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-brand-cream-muted/50 hover:text-brand-cream-muted text-xs transition-colors">{t('privacy')}</Link>
            <Link href="#" className="text-brand-cream-muted/50 hover:text-brand-cream-muted text-xs transition-colors">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
