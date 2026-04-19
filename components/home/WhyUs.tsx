'use client';

import { useTranslations } from 'next-intl';

const ITEM_KEYS = ['mobile', 'quality', 'experts', 'satisfaction'] as const;

export default function WhyUs() {
  const t = useTranslations('whyUs');

  return (
    <section id="why-us" className="bg-brand-black-soft section-pad relative overflow-hidden">
      {/* Subtle blue line accent */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-brand-blue/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 mb-20 items-end">
          <div>
            <span className="eyebrow">{t('title')}</span>
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] text-brand-cream mt-3 leading-none">
              Pourquoi<br />nous choisir
            </h2>
          </div>
          <p className="text-brand-cream-muted text-sm leading-relaxed font-light max-w-lg lg:pb-2">
            {t('subtitle')}
          </p>
        </div>

        {/* Items — horizontal numbered list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-brand-black-border divide-y sm:divide-y-0 sm:divide-x divide-brand-black-border">
          {ITEM_KEYS.map((key, index) => (
            <div key={key} className="p-8 lg:p-10 relative group">
              {/* Number — ghost */}
              <div className="font-display text-[5rem] leading-none text-brand-black-border/50 group-hover:text-brand-gold/10 transition-colors duration-500 mb-4 select-none">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="font-display text-2xl text-brand-cream mb-3 group-hover:text-brand-gold transition-colors duration-300">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-brand-cream-muted text-sm leading-relaxed font-light">
                {t(`items.${key}.description`)}
              </p>
              {/* Gold bottom accent on hover */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
