'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Phone, Mail, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function ContactCTA() {
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');
  const { locale } = useParams();

  const contactInfo = [
    { icon: Phone, label: t('phone'), value: '514-555-0100' },
    { icon: Mail, label: t('email'), value: 'info@eclatauto.ca' },
    { icon: Clock, label: t('hours'), value: t('hoursValue') },
    { icon: MapPin, label: t('zone'), value: t('zoneValue') },
  ];

  return (
    <section id="contact" className="py-24 px-4 bg-brand-black-soft">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: CTA */}
          <div>
            <span className="text-brand-gold text-sm font-semibold uppercase tracking-widest">
              {locale === 'fr' ? 'Prêt à commencer?' : 'Ready to start?'}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-brand-cream mt-2 mb-6 leading-tight">
              {t('title')}
            </h2>
            <p className="text-brand-cream-muted text-lg mb-8 leading-relaxed">
              {t('subtitle')}
            </p>
            <Link
              href={`/${locale}/reservation`}
              className="btn-gold inline-flex items-center gap-2 text-base px-8 py-4"
            >
              {t('cta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: Contact info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactInfo.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="card-dark p-5 flex items-start gap-4 hover:border-brand-gold/30 transition-all"
              >
                <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <div className="text-brand-cream-muted text-xs mb-0.5">{label}</div>
                  <div className="text-brand-cream text-sm font-medium">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
