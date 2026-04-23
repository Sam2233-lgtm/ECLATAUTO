import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Droplets, Wind, ArrowRight } from 'lucide-react';
import { getActiveServiceCards } from '@/lib/db-services';

interface ServiceCardProps {
  locale: string;
}

type Prices = {
  berline?: number;
  vus?: number;
  pickup?: number;
  fourgonnette?: number;
  [key: string]: number | undefined;
};

const PRICE_ROWS = [
  { key: 'berline',      labelFr: 'Berline',       labelEn: 'Sedan' },
  { key: 'vus',          labelFr: 'VUS',            labelEn: 'SUV' },
  { key: 'pickup',       labelFr: 'Pick-up',        labelEn: 'Pick-up' },
  { key: 'fourgonnette', labelFr: 'Fourgonnette',   labelEn: 'Minivan' },
];

// Fallback icons per service order
const ICONS = [Sparkles, Droplets, Wind];

export default async function ServiceCardsSection({ locale }: ServiceCardProps) {
  const cards = await getActiveServiceCards();
  if (cards.length === 0) return null;

  const isFr = locale === 'fr';

  return (
    <section id="services" className="bg-brand-black section-pad">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <span className="eyebrow">{isFr ? 'Ce que nous offrons' : 'What we offer'}</span>
            <h2 className="font-display text-[clamp(3rem,7vw,5.5rem)] text-brand-cream mt-3 leading-none">
              {isFr ? 'Nos services' : 'Our services'}
            </h2>
          </div>
          <p className="text-brand-cream-muted text-sm leading-relaxed max-w-xs font-light">
            {isFr
              ? 'Détailing professionnel à domicile, adapté à votre véhicule et votre budget.'
              : 'Professional mobile detailing, tailored to your vehicle and budget.'}
          </p>
        </div>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const prices = card.prices as Prices;
            const Icon = ICONS[idx % ICONS.length];

            return (
              <div
                key={card.id}
                className="border border-brand-black-border bg-brand-black-soft flex flex-col group hover:border-brand-gold/30 transition-colors duration-300"
              >
                {/* Image or placeholder */}
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-black-card flex items-center justify-center">
                  {card.imageUrl ? (
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-brand-black-border group-hover:text-brand-gold/20 transition-colors duration-300">
                      <Icon className="w-12 h-12" strokeWidth={1} />
                      <span className="font-display text-6xl select-none leading-none opacity-30">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  {/* Gold bottom line on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6">
                  <h3 className="font-display text-2xl text-brand-cream leading-none mb-3 group-hover:text-brand-gold transition-colors duration-300">
                    {card.name}
                  </h3>
                  <p className="text-brand-cream-muted text-sm leading-relaxed font-light mb-6 flex-1">
                    {card.description}
                  </p>

                  {/* Price table */}
                  <div className="border-t border-brand-black-border pt-4 mb-6 space-y-2">
                    {PRICE_ROWS.map(({ key, labelFr, labelEn }) => {
                      const price = prices[key];
                      if (price === undefined || price === 0) return null;
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-brand-cream-muted/60 text-xs font-sans uppercase tracking-wider">
                            {isFr ? labelFr : labelEn}
                          </span>
                          <span className="font-display text-lg text-brand-gold leading-none tabular-nums">
                            {price.toFixed(2)}$
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/${locale}/reservation`}
                    className="group/btn inline-flex items-center gap-2 text-brand-cream text-xs font-sans font-bold uppercase tracking-widest hover:text-brand-gold transition-colors"
                  >
                    {isFr ? 'Réserver' : 'Book now'}
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-brand-black-border pt-8">
          <p className="text-brand-cream-muted text-sm font-light max-w-xs">
            {isFr ? "Besoin d'un service sur mesure? On s'adapte." : 'Need something custom? We adapt.'}
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
