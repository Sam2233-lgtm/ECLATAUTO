import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Check, ArrowRight, Droplets, Sparkles, Wind, Shield, Star, Car, Zap, Award } from 'lucide-react';
import { getActiveServicesWithPromos, calcPromoPrice, type DbService } from '@/lib/db-services';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets, Sparkles, Wind, Shield, Star, Car, Zap, Award,
};

interface ServicesProps {
  locale: string;
}

export default async function Services({ locale }: ServicesProps) {
  const t = await getTranslations({ locale, namespace: 'services' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const services = await getActiveServicesWithPromos();

  if (services.length === 0) return null;

  return (
    <section id="services" className="py-24 px-4 bg-brand-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-brand-gold text-sm font-semibold uppercase tracking-widest">
            {locale === 'fr' ? 'Ce que nous offrons' : 'What we offer'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-cream mt-2">{t('title')}</h2>
          <div className="gold-divider" />
          <p className="text-brand-cream-muted text-lg mt-4 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = ICON_MAP[service.iconName] || Sparkles;
            const name = locale === 'fr' ? service.nameFr : service.nameEn;
            const description = locale === 'fr' ? service.descriptionFr : service.descriptionEn;
            const includesRaw = locale === 'fr' ? service.includesFr : service.includesEn;
            const includes = includesRaw.split('\n').filter(Boolean);
            const promoPrice = service.promotion ? calcPromoPrice(service.basePrice, service.promotion) : null;

            return (
              <div key={service.id} className="card-dark-hover p-7 flex flex-col group relative">
                {/* Promo badge */}
                {service.promotion && (
                  <div className="absolute -top-3 -right-3 bg-brand-gold text-brand-black text-xs font-black px-3 py-1 rounded-full shadow-lg">
                    {service.promotion.discountType === 'percentage'
                      ? `-${service.promotion.discountValue}%`
                      : `-${service.promotion.discountValue}$`}
                  </div>
                )}

                {/* Icon & price */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors">
                    <Icon className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-brand-cream-muted">{tCommon('from')}</div>
                    {promoPrice !== null ? (
                      <div>
                        <span className="line-through text-brand-cream-muted text-sm mr-1">
                          {tCommon('currency')}{service.basePrice}
                        </span>
                        <span className="text-brand-gold font-bold text-lg">
                          {tCommon('currency')}{promoPrice}
                        </span>
                      </div>
                    ) : (
                      <div className="text-brand-gold font-bold text-lg">
                        {tCommon('currency')}{service.basePrice}
                      </div>
                    )}
                  </div>
                </div>

                {/* Promo name */}
                {service.promotion && (
                  <div className="mb-3 px-2 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-lg">
                    <p className="text-brand-gold text-xs font-semibold">🏷 {service.promotion.name}</p>
                  </div>
                )}

                <h3 className="text-brand-cream font-semibold text-lg mb-2">{name}</h3>
                <p className="text-brand-cream-muted text-sm leading-relaxed mb-5 flex-1">{description}</p>

                {includes.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-brand-gold flex-shrink-0" />
                        <span className="text-brand-cream-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={`/${locale}/reservation`}
                  className="flex items-center justify-center gap-2 w-full border border-brand-black-border rounded-lg py-2.5 text-sm text-brand-cream-muted
                             hover:border-brand-gold/40 hover:text-brand-gold transition-all duration-200 mt-auto group/btn"
                >
                  {tCommon('bookNow')}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}

          {/* CTA card */}
          <div className="md:col-span-2 lg:col-span-3 mt-2">
            <div className="bg-gradient-to-r from-brand-gold/10 via-brand-gold/5 to-brand-gold/10 border border-brand-gold/20 rounded-2xl p-8 text-center">
              <p className="text-brand-cream-muted mb-4 text-sm">
                {locale === 'fr'
                  ? "Vous avez besoin d'un service personnalisé? Contactez-nous pour un devis gratuit."
                  : 'Need a custom service? Contact us for a free quote.'}
              </p>
              <Link href={`/${locale}/reservation`} className="btn-gold inline-flex items-center gap-2">
                {tCommon('bookNow')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
