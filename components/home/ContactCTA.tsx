'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Phone, Mail, Clock, MapPin, ArrowRight } from 'lucide-react';

interface ContactCTAProps {
  phone: string;
  email: string;
}

export default function ContactCTA({ phone, email }: ContactCTAProps) {
  const t = useTranslations('contact');
  const { locale } = useParams();

  return (
    <section id="contact" className="bg-brand-black-soft section-pad relative overflow-hidden">
      {/* Gold glow — bottom right */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-0 border border-brand-black-border">

          {/* Left — CTA */}
          <div className="p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-brand-black-border flex flex-col justify-between">
            <div>
              <span className="eyebrow">
                {locale === 'fr' ? 'Prêt à commencer?' : 'Ready to start?'}
              </span>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-brand-cream mt-4 mb-6 leading-none">
                {t('title')}
              </h2>
              <p className="text-brand-cream-muted text-sm leading-relaxed font-light max-w-sm">
                {t('subtitle')}
              </p>
            </div>
            <div className="mt-10">
              <Link
                href={`/${locale}/reservation`}
                className="group inline-flex items-center gap-3 bg-brand-gold text-brand-black font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-brand-gold-light transition-colors duration-200"
              >
                {t('cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right — Contact info */}
          <div className="divide-y divide-brand-black-border">
            {[
              { icon: Phone, label: t('phone'), value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
              { icon: Mail, label: t('email'), value: email, href: `mailto:${email}` },
              { icon: Clock, label: t('hours'), value: t('hoursValue'), href: null },
              { icon: MapPin, label: t('zone'), value: t('zoneValue'), href: null },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-5 px-8 py-6">
                <Icon className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-brand-cream-muted/50 text-[10px] uppercase tracking-widest font-sans mb-0.5">
                    {label}
                  </div>
                  {href ? (
                    <a
                      href={href}
                      className="text-brand-cream text-sm font-sans hover:text-brand-gold transition-colors truncate block"
                    >
                      {value}
                    </a>
                  ) : (
                    <div className="text-brand-cream text-sm font-sans">{value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
