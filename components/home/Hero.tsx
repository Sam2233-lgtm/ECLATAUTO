import Link from 'next/link';
import { ArrowRight, Star, Users, Award, MapPin } from 'lucide-react';
import { getSiteSettings } from '@/lib/db-services';

interface HeroProps {
  locale: string;
}

export default async function Hero({ locale }: HeroProps) {
  const settings = await getSiteSettings();

  const isFr = locale === 'fr';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-black via-[#0f0f0f] to-brand-black" />

        {/* Gold glow effects */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-brand-gold/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-gold/5 rounded-full blur-[100px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(to right, #C9A84C 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
          <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse" />
          <span className="text-brand-gold text-sm font-medium">{settings.heroBadge}</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-6 animate-slide-up">
          <span className="text-brand-cream block">{settings.heroTitle}</span>
          <span className="text-gradient-gold block">{settings.heroTitleHighlight}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-brand-cream-muted text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed animate-fade-in">
          {settings.heroSubtitle}
        </p>

        {/* Service at home badge */}
        <div className="flex justify-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-semibold">
              {isFr
                ? 'Nous nous déplaçons à votre adresse — aucun déplacement requis'
                : 'We come to your address — no travel required on your part'}
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 mb-16 animate-fade-in">
          <Link
            href={`/${locale}/reservation`}
            className="btn-gold flex items-center gap-2 text-base px-8 py-4"
          >
            {isFr ? 'Réserver un service' : 'Book a Service'}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/${locale}#services`}
            className="text-brand-cream-muted hover:text-brand-gold text-sm transition-colors underline-offset-4 hover:underline"
          >
            {isFr ? 'Voir nos services' : 'View Our Services'}
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-gold" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-brand-cream animate-count-up">{settings.statClients}</div>
              <div className="text-brand-cream-muted text-sm">
                {isFr ? 'Clients satisfaits' : 'Happy Clients'}
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-brand-black-border hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-brand-gold" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-brand-cream animate-count-up">{settings.statYears}</div>
              <div className="text-brand-cream-muted text-sm">
                {isFr ? "Années d'expérience" : 'Years of Experience'}
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-brand-black-border hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-brand-cream animate-count-up">{settings.statRating}</div>
              <div className="text-brand-cream-muted text-sm">
                {isFr ? 'Évaluation moyenne' : 'Average Rating'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-black to-transparent pointer-events-none" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-6 h-10 border-2 border-brand-cream-muted/30 rounded-full flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-brand-gold rounded-full" />
        </div>
      </div>
    </section>
  );
}
