import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
  { key: 'berline',      labelFr: 'Berline',     labelEn: 'Sedan' },
  { key: 'vus',          labelFr: 'VUS',          labelEn: 'SUV' },
  { key: 'pickup',       labelFr: 'Pick-up',      labelEn: 'Pick-up' },
  { key: 'fourgonnette', labelFr: 'Fourgonnette', labelEn: 'Minivan' },
];

const INDEX_NUMS = ['01', '02', '03', '04', '05'];

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
        {/*
          gap-0 + divide creates shared 1px borders between cards.
          Outer border wraps the whole grid.
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-brand-black-border divide-y md:divide-y-0 md:divide-x divide-brand-black-border">
          {cards.map((card, idx) => {
            const prices = card.prices as Prices;
            const indexNum = INDEX_NUMS[idx] ?? String(idx + 1).padStart(2, '0');

            const validPrices = PRICE_ROWS.filter(({ key }) => {
              const p = prices[key];
              return p !== undefined && p > 0;
            });

            return (
              <div
                key={card.id}
                className="relative bg-brand-black-soft flex flex-col group overflow-hidden"
              >
                {/* Gold top accent — reveals on hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-transparent group-hover:bg-brand-gold transition-colors duration-500 z-10" />

                {/* Large watermark index */}
                <div
                  className="absolute top-2 right-4 font-display leading-none select-none pointer-events-none tabular-nums text-brand-cream/[0.03] group-hover:text-brand-gold/[0.07] transition-colors duration-700"
                  style={{ fontSize: 'clamp(5rem, 8vw, 7.5rem)' }}
                  aria-hidden="true"
                >
                  {indexNum}
                </div>

                <div className="flex flex-col flex-1 p-8 pt-10">

                  {/* Index line */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-sans text-[10px] text-brand-gold tracking-[0.3em] tabular-nums">
                      {indexNum}
                    </span>
                    <div className="flex-1 h-px bg-brand-black-border" />
                  </div>

                  {/* Service name */}
                  <h3 className="font-display text-[2.4rem] leading-none text-brand-cream mb-4 group-hover:text-brand-gold transition-colors duration-300">
                    {card.name}
                  </h3>

                  {/* Description */}
                  <p className="text-brand-cream-muted/70 text-sm leading-relaxed font-light mb-8 flex-1">
                    {card.description}
                  </p>

                  {/* Price ledger */}
                  {validPrices.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-brand-cream-muted/30 text-[9px] uppercase tracking-[0.3em] font-sans">
                          {isFr ? 'Tarifs' : 'Pricing'}
                        </span>
                        <div className="flex-1 h-px bg-brand-black-border" />
                      </div>
                      <div className="space-y-2.5">
                        {validPrices.map(({ key, labelFr, labelEn }) => {
                          const price = prices[key]!;
                          return (
                            <div key={key} className="flex items-baseline gap-1">
                              <span className="text-brand-cream-muted/45 text-xs font-sans uppercase tracking-wider whitespace-nowrap">
                                {isFr ? labelFr : labelEn}
                              </span>
                              {/* Dotted leader */}
                              <span className="flex-1 border-b border-dotted border-brand-black-border/50 mb-0.5 mx-1" />
                              <span className="font-display text-xl text-brand-gold leading-none tabular-nums">
                                {price.toFixed(0)}
                                <span className="text-sm text-brand-gold/60 ml-0.5">$</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={`/${locale}/reservation`}
                    className="group/btn flex items-center justify-between border-t border-brand-black-border pt-5 hover:border-brand-gold/20 transition-colors duration-300"
                  >
                    <span className="text-brand-cream-muted/60 text-[10px] font-sans font-bold uppercase tracking-[0.3em] group-hover/btn:text-brand-gold transition-colors duration-200">
                      {isFr ? 'Réserver' : 'Book now'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-cream-muted/40 group-hover/btn:text-brand-gold group-hover/btn:translate-x-1 transition-all duration-200" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-brand-black-border pt-8">
          <p className="text-brand-cream-muted/60 text-sm font-light max-w-xs">
            {isFr
              ? "Besoin d'un service sur mesure? On s'adapte."
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
