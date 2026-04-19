'use client';

import { useTranslations } from 'next-intl';

const STEP_KEYS = ['book', 'arrive', 'enjoy'] as const;

export default function Process() {
  const t = useTranslations('process');

  return (
    <section className="bg-brand-black section-pad">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-16">
          <span className="eyebrow">{t('title')}</span>
          <div className="flex-1 h-px bg-brand-black-border" />
        </div>

        {/* Steps — horizontal timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
          {/* Connector */}
          <div className="absolute top-8 left-[16.5%] right-[16.5%] h-px bg-brand-black-border hidden md:block" />

          {STEP_KEYS.map((key, index) => (
            <div key={key} className="relative flex flex-col items-start md:items-center text-left md:text-center p-6 md:px-8">
              {/* Step number */}
              <div className="relative mb-6">
                <div className="w-16 h-16 border border-brand-black-border flex items-center justify-center relative z-10 bg-brand-black">
                  <span className="font-display text-3xl text-brand-gold leading-none">
                    {index + 1}
                  </span>
                </div>
                {/* Gold dot for active feel */}
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-gold" />
                )}
              </div>

              <h3 className="font-display text-2xl text-brand-cream mb-3 leading-none">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="text-brand-cream-muted text-sm leading-relaxed font-light max-w-xs">
                {t(`steps.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
