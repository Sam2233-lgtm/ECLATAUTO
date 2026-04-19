import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { getActiveServicesWithPromos, calcPromoPrice } from '@/lib/db-services';

interface ServicesProps {
  locale: string;
}

export default async function Services({ locale }: ServicesProps) {
  const t = await getTranslations({ locale, namespace: 'services' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const services = await getActiveServicesWithPromos();
  if (services.length === 0) return null;
  const isFr = locale === 'fr';

  return (
    <section id="services" className="bg-brand-black-soft section-pad">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <span className="eyebrow">{isFr ? 'Ce que nous offrons' : 'What we offer'}</span>
            <h2 className="font-display text-[clamp(3rem,7vw,5.5rem)] text-brand-cream mt-3 leading-none">
              {t('title')}
            </h2>
          </div>
          <p className="text-brand-cream-muted text-sm leading-relaxed max-w-xs font-light">
            {t('subtitle')}
          </p>
        </div>

        {/* ── Services list — éditorial numéroté ── */}
        <div className="border-t border-brand-black-border">
          {services.map((service, index) => {
            const name = isFr ? service.nameFr : service.nameEn;
            const description = isFr ? service.descriptionFr : service.descriptionEn;
            const includes = (isFr ? service.includesFr : service.includesEn)
              .split('\n').filter(Boolean).slice(0, 3);
            const promoPrice = service.promotion
              ? calcPromoPrice(service.basePrice, service.promotion)
              : null;
            const displayPrice = promoPrice ?? service.basePrice;

            return (
              <Link
                key={service.id}
                href={`/${locale}/reservation`}
                className="group flex items-start gap-6 sm:gap-10 py-8 border-b border-brand-black-border hover:bg-brand-black/60 transition-colors duration-300 -mx-6 sm:-mx-10 lg:-mx-16 px-6 sm:px-10 lg:px-16"
              >
                {/* Number */}
                <span className="font-display text-5xl sm:text-6xl text-brand-black-border group-hover:text-brand-gold/20 transition-colors duration-300 leading-none flex-shrink-0 pt-1 select-none tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <h3 className="font-display text-3xl sm:text-4xl text-brand-cream group-hover:text-brand-gold transition-colors duration-300 leading-none">
                      {name}
                    </h3>
                    {service.promotion && (
                      <span className="bg-brand-gold text-brand-black font-sans text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                        {service.promotion.discountType === 'percentage'
                          ? `−${service.promotion.discountValue}%`
                          : `−${service.promotion.discountValue}$`}
                      </span>
                    )}
                  </div>
                  <p className="text-brand-cream-muted text-sm leading-relaxed mb-4 font-light max-w-lg">
                    {description}
                  </p>
                  {includes.length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-x-5 gap-y-1">
                      {includes.map((item, i) => (
                        <span key={i} className="text-brand-cream-muted/40 text-xs font-sans">
                          — {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price + arrow */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1 pt-1">
                  {promoPrice !== null && (
                    <span className="text-brand-cream-muted/30 text-xs line-through tabular-nums font-sans">
                      {tCommon('currency')}{service.basePrice}
                    </span>
                  )}
                  <span className="font-display text-3xl sm:text-4xl text-brand-gold leading-none tabular-nums">
                    {tCommon('currency')}{displayPrice}
                  </span>
                  <span className="text-brand-cream-muted/40 text-[10px] uppercase tracking-wider font-sans">
                    {service.duration} min
                  </span>
                  <ArrowRight className="w-4 h-4 text-brand-black-border group-hover:text-brand-gold group-hover:translate-x-1 transition-all duration-300 mt-2" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-brand-cream-muted text-sm font-light max-w-xs">
            {isFr
              ? 'Besoin d\'un service sur mesure? On s\'adapte.'
              : 'Need something custom? We adapt.'}
          </p>
          <Link
            href={`/${locale}/devis`}
            className="group inline-flex items-center gap-2 text-brand-cream text-sm font-sans font-semibold uppercase tracking-widest border-b border-brand-black-border hover:border-brand-gold hover:text-brand-gold pb-0.5 transition-all duration-200"
          >
            {isFr ? 'Demander un devis gratuit' : 'Get a free quote'}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
