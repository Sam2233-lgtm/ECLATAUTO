import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { getSiteSettings } from '@/lib/db-services';

type Settings = Awaited<ReturnType<typeof getSiteSettings>>;

interface HeroProps {
  locale: string;
  settings: Settings;
}

export default function Hero({ locale, settings }: HeroProps) {
  const isFr = locale === 'fr';

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-brand-black">

      {/* ── Background ── */}
      <div className="absolute inset-0">
        {/* Deep gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#08090a] via-[#0c0e14] to-[#08090a]" />
        {/* Blue glow — top right, from logo */}
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-brand-blue/10 blur-[150px] pointer-events-none" />
        {/* Gold glow — bottom left */}
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-brand-gold/8 blur-[120px] pointer-events-none" />
        {/* Vertical gold line accent */}
        <div className="absolute top-0 bottom-0 left-[7%] w-px bg-gradient-to-b from-transparent via-brand-gold/20 to-transparent hidden lg:block" />
        {/* Horizontal scan line */}
        <div className="absolute top-[40%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/15 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-20 pt-36">

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-end">

          {/* Left — typography */}
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-px bg-brand-gold" />
              <span className="eyebrow">
                {isFr ? 'Détailing premium · Grand Montréal' : 'Premium detailing · Greater Montreal'}
              </span>
            </div>

            {/* Headline — Bebas Neue massif */}
            <h1 className="font-display leading-none mb-6">
              <span className="block text-[clamp(4rem,11vw,9.5rem)] text-brand-cream tracking-wide">
                {settings.heroTitle}
              </span>
              <span className="block text-[clamp(4rem,11vw,9.5rem)] text-stroke-gold tracking-wide">
                {settings.heroTitleHighlight}
              </span>
            </h1>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-brand-gold" />
              <div className="w-2 h-2 rounded-full bg-brand-blue-bright" />
              <div className="flex-1 h-px bg-brand-black-border max-w-xs" />
            </div>

            {/* Subtitle */}
            <p className="text-brand-cream-muted text-base leading-relaxed max-w-md mb-10 font-sans font-light">
              {settings.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href={`/${locale}/reservation`}
                className="group inline-flex items-center gap-3 bg-brand-gold text-brand-black font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-brand-gold-light transition-colors duration-200"
              >
                {isFr ? 'Réserver maintenant' : 'Book Now'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={`/${locale}#services`}
                className="inline-flex items-center gap-2 text-brand-cream-muted hover:text-brand-gold text-sm font-sans uppercase tracking-widest transition-colors duration-200 py-4"
              >
                {isFr ? 'Voir les services' : 'Our services'}
              </Link>
            </div>
          </div>

          {/* Right — stats block */}
          <div className="hidden lg:flex flex-col gap-0 border border-brand-black-border">
            <div className="px-8 py-7 border-b border-brand-black-border">
              <div className="font-display text-6xl text-brand-gold tracking-wide">
                {settings.statClients}
              </div>
              <div className="text-brand-cream-muted text-xs uppercase tracking-widest mt-1 font-sans">
                {isFr ? 'Clients satisfaits' : 'Happy clients'}
              </div>
            </div>
            <div className="px-8 py-7 border-b border-brand-black-border">
              <div className="font-display text-6xl text-brand-cream tracking-wide">
                {settings.statRating}
              </div>
              <div className="text-brand-cream-muted text-xs uppercase tracking-widest mt-1 font-sans">
                {isFr ? 'Note Google' : 'Google rating'}
              </div>
            </div>
            <div className="px-8 py-7">
              <div className="font-display text-6xl text-brand-blue-light tracking-wide">
                {settings.statYears}
              </div>
              <div className="text-brand-cream-muted text-xs uppercase tracking-widest mt-1 font-sans">
                {isFr ? "Années d'expérience" : 'Years of experience'}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile stats — horizontal */}
        <div className="flex lg:hidden items-center gap-0 mt-12 border border-brand-black-border divide-x divide-brand-black-border">
          <div className="flex-1 px-5 py-5">
            <div className="font-display text-4xl text-brand-gold">{settings.statClients}</div>
            <div className="text-brand-cream-muted text-[10px] uppercase tracking-widest font-sans mt-0.5">Clients</div>
          </div>
          <div className="flex-1 px-5 py-5">
            <div className="font-display text-4xl text-brand-cream">{settings.statRating}</div>
            <div className="text-brand-cream-muted text-[10px] uppercase tracking-widest font-sans mt-0.5">Google</div>
          </div>
          <div className="flex-1 px-5 py-5">
            <div className="font-display text-4xl text-brand-blue-light">{settings.statYears}</div>
            <div className="text-brand-cream-muted text-[10px] uppercase tracking-widest font-sans mt-0.5">{isFr ? 'Années' : 'Years'}</div>
          </div>
        </div>
      </div>

      {/* Bottom edge line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
    </section>
  );
}
