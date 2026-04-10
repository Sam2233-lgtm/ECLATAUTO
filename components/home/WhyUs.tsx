'use client';

import { useTranslations } from 'next-intl';
import { Car, Leaf, BadgeCheck, HeartHandshake } from 'lucide-react';

const ICONS = [Car, Leaf, BadgeCheck, HeartHandshake];
const ITEM_KEYS = ['mobile', 'quality', 'experts', 'satisfaction'] as const;

export default function WhyUs() {
  const t = useTranslations('whyUs');

  return (
    <section id="why-us" className="py-24 px-4 bg-brand-black-soft">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">{t('title')}</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEM_KEYS.map((key, index) => {
            const Icon = ICONS[index];
            return (
              <div
                key={key}
                className="group text-center p-8 rounded-2xl border border-transparent hover:border-brand-gold/20 hover:bg-brand-gold/5 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-brand-gold/20 transition-colors">
                  <Icon className="w-7 h-7 text-brand-gold" />
                </div>
                <h3 className="text-brand-cream font-semibold text-lg mb-3">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-brand-cream-muted text-sm leading-relaxed">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Testimonial snippet */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="card-dark p-8 text-center relative">
            <div className="text-5xl text-brand-gold/20 font-serif absolute top-4 left-6">"</div>
            <p className="text-brand-cream-muted text-base italic leading-relaxed relative z-10">
              {`"Un service absolument impeccable. Mon véhicule n'a jamais été aussi propre et ils sont venus directement chez moi. Je recommande sans hésiter!"`}
            </p>
            <div className="flex items-center justify-center gap-1 mt-4 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-brand-gold fill-brand-gold" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-brand-gold text-sm font-semibold">Marie T., Montréal</p>
          </div>
        </div>
      </div>
    </section>
  );
}
