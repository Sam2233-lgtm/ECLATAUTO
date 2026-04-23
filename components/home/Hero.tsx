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
      <style>{`
        @keyframes hero-scroll {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(8px); opacity: 0.15; }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.7); }
        }
        .hero-scroll-line { animation: hero-scroll 2.8s ease-in-out infinite; }
        .eyebrow-dot { animation: dot-pulse 2.5s ease-in-out infinite; }
      `}</style>

      {/* ── Background ── */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#060708] via-[#0b0d12] to-[#060708]" />
        {/* Blue glow — top right */}
        <div className="absolute -top-60 -right-40 w-[800px] h-[800px] rounded-full bg-brand-blue/8 blur-[180px] pointer-events-none" />
        {/* Gold glow — bottom left */}
        <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] rounded-full bg-brand-gold/5 blur-[150px] pointer-events-none" />
        {/* Subtle center glow */}
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-brand-gold/[0.025] blur-[100px] pointer-events-none" />
        {/* Vertical gold line — left rail */}
        <div className="absolute top-0 bottom-0 left-[7%] w-px bg-gradient-to-b from-transparent via-brand-gold/20 to-transparent hidden lg:block" />
        {/* Horizontal scan line */}
        <div className="absolute top-[42%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/10 to-transparent" />
        {/* Grain noise */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            opacity: 0.032,
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-20 pt-36">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-end">

          {/* Left — typography */}
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-7">
              <span className="eyebrow-dot inline-block w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
              <div className="w-5 h-px bg-brand-gold/60 flex-shrink-0" />
              <span className="eyebrow">
                {isFr ? 'Détailing premium · Grand Montréal' : 'Premium detailing · Greater Montreal'}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display leading-none mb-7">
              <span className="block text-[clamp(4rem,11vw,9.5rem)] text-brand-cream tracking-wide">
                {settings.heroTitle}
              </span>
              <span className="block text-[clamp(4rem,11vw,9.5rem)] text-stroke-gold tracking-wide -mt-3">
                {settings.heroTitleHighlight}
              </span>
            </h1>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-brand-gold" />
              <div className="w-1.5 h-1.5 rounded-full bg-brand-blue-bright" />
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
          <div className="hidden lg:block">
            {/* Header label */}
            <div className="border border-b-0 border-brand-black-border px-6 py-2.5 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-gold/40" />
              <span className="text-brand-cream-muted/25 text-[9px] uppercase tracking-[0.35em] font-sans tabular-nums">
                {isFr ? 'Éclat Auto · Chiffres' : 'Éclat Auto · Figures'}
              </span>
            </div>
            {/* Stats */}
            <div className="flex flex-col border border-brand-black-border">
              <div className="relative px-8 py-7 border-b border-brand-black-border overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-0.5 bg-brand-gold/30" />
                <div className="font-display text-6xl text-brand-gold tracking-wide tabular-nums">
                  {settings.statClients}
                </div>
                <div className="text-brand-cream-muted/60 text-xs uppercase tracking-widest mt-1 font-sans">
                  {isFr ? 'Clients satisfaits' : 'Happy clients'}
                </div>
              </div>
              <div className="relative px-8 py-7 border-b border-brand-black-border overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-0.5 bg-brand-cream/10" />
                <div className="font-display text-6xl text-brand-cream tracking-wide tabular-nums">
                  {settings.statRating}
                </div>
                <div className="text-brand-cream-muted/60 text-xs uppercase tracking-widest mt-1 font-sans">
                  {isFr ? 'Note Google' : 'Google rating'}
                </div>
              </div>
              <div className="relative px-8 py-7 overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-0.5 bg-brand-blue-light/20" />
                <div className="font-display text-6xl text-brand-blue-light tracking-wide tabular-nums">
                  {settings.statYears}
                </div>
                <div className="text-brand-cream-muted/60 text-xs uppercase tracking-widest mt-1 font-sans">
                  {isFr ? "Années d'expérience" : 'Years of experience'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile stats */}
        <div className="flex lg:hidden items-center mt-12 border border-brand-black-border divide-x divide-brand-black-border">
          <div className="flex-1 px-5 py-5">
            <div className="font-display text-4xl text-brand-gold tabular-nums">{settings.statClients}</div>
            <div className="text-brand-cream-muted/50 text-[10px] uppercase tracking-widest font-sans mt-0.5">Clients</div>
          </div>
          <div className="flex-1 px-5 py-5">
            <div className="font-display text-4xl text-brand-cream tabular-nums">{settings.statRating}</div>
            <div className="text-brand-cream-muted/50 text-[10px] uppercase tracking-widest font-sans mt-0.5">Google</div>
          </div>
          <div className="flex-1 px-5 py-5">
            <div className="font-display text-4xl text-brand-blue-light tabular-nums">{settings.statYears}</div>
            <div className="text-brand-cream-muted/50 text-[10px] uppercase tracking-widest font-sans mt-0.5">
              {isFr ? 'Années' : 'Years'}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 z-10">
        <span className="text-brand-cream-muted/25 text-[8px] uppercase tracking-[0.45em] font-sans">
          {isFr ? 'Défiler' : 'Scroll'}
        </span>
        <div className="hero-scroll-line w-px h-10 bg-gradient-to-b from-brand-gold/50 to-transparent" />
      </div>

      {/* Bottom edge line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/25 to-transparent" />
    </section>
  );
}
