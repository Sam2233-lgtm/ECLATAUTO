'use client';

import { useTranslations } from 'next-intl';
import { MousePointerClick, Truck, Sparkles } from 'lucide-react';

const STEP_ICONS = [MousePointerClick, Truck, Sparkles];
const STEP_KEYS = ['book', 'arrive', 'enjoy'] as const;

export default function Process() {
  const t = useTranslations('process');

  return (
    <section className="py-24 px-4 bg-brand-black">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">{t('title')}</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">{t('subtitle')}</p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-10 left-[calc(16.67%+1px)] right-[calc(16.67%+1px)] h-px bg-gradient-to-r from-brand-gold/0 via-brand-gold/40 to-brand-gold/0 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STEP_KEYS.map((key, index) => {
              const Icon = STEP_ICONS[index];
              return (
                <div key={key} className="text-center relative">
                  {/* Step number + icon */}
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-brand-black-card border-2 border-brand-gold/30 rounded-2xl flex items-center justify-center mx-auto group hover:border-brand-gold/60 hover:bg-brand-gold/10 transition-all duration-300">
                      <Icon className="w-8 h-8 text-brand-gold" />
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center">
                      <span className="text-brand-black text-xs font-black">{index + 1}</span>
                    </div>
                  </div>

                  <h3 className="text-brand-cream font-semibold text-xl mb-3">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="text-brand-cream-muted text-sm leading-relaxed max-w-xs mx-auto">
                    {t(`steps.${key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
