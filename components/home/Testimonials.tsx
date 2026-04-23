import Image from 'next/image';
import { getActiveTestimonials } from '@/lib/db-services';

interface TestimonialsProps {
  locale: string;
}

export default async function Testimonials({ locale }: TestimonialsProps) {
  const testimonials = await getActiveTestimonials();
  if (testimonials.length === 0) return null;
  const isFr = locale === 'fr';

  const [featured, ...rest] = testimonials;

  return (
    <section id="testimonials" className="bg-brand-black-soft section-pad relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-brand-blue/4 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-brand-gold/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <span className="eyebrow">{isFr ? 'Témoignages' : 'Testimonials'}</span>
            <div className="w-10 h-px bg-brand-black-border" />
            <span className="text-brand-cream-muted/25 text-[10px] font-sans tabular-nums">
              {testimonials.length.toString().padStart(2, '0')}
            </span>
          </div>
          {/* Google Reviews badge */}
          <div className="hidden sm:flex items-center gap-3 border border-brand-black-border px-4 py-2.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-brand-gold text-[11px]">★</span>
              ))}
            </div>
            <div className="w-px h-3 bg-brand-black-border" />
            <span className="text-brand-cream-muted/40 text-[9px] font-sans uppercase tracking-[0.25em]">
              Google Reviews
            </span>
          </div>
        </div>

        {/* ── Featured quote ── */}
        {featured && (
          <div className="mb-20 lg:mb-24 relative">
            {/* Oversized decorative quotation mark */}
            <div
              className="absolute -top-6 -left-4 lg:-left-10 font-display leading-none text-brand-gold/[0.07] pointer-events-none select-none"
              style={{ fontSize: 'clamp(8rem, 18vw, 16rem)' }}
              aria-hidden="true"
            >
              &ldquo;
            </div>

            <div className="relative">
              {/* Stars */}
              <div className="flex items-center gap-1.5 mb-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-base leading-none ${i < featured.stars ? 'text-brand-gold' : 'text-brand-black-border'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-3 text-brand-cream-muted/30 text-xs font-sans tabular-nums">
                  {featured.stars}.0&thinsp;/&thinsp;5
                </span>
              </div>

              {/* Quote text */}
              <blockquote className="font-display text-[clamp(1.9rem,4.5vw,3.6rem)] text-brand-cream leading-[1.08] mb-10 max-w-4xl">
                &ldquo;{featured.text}&rdquo;
              </blockquote>

              {/* Client attribution */}
              <div className="flex items-center gap-5">
                {featured.photoUrl ? (
                  <Image
                    src={featured.photoUrl}
                    alt={featured.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover grayscale flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 border border-brand-gold/20 flex items-center justify-center flex-shrink-0 bg-brand-gold/5">
                    <span className="font-display text-xl text-brand-gold leading-none">
                      {featured.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <div className="text-brand-cream font-sans font-semibold text-sm tracking-wide">
                      {featured.name}
                    </div>
                    {featured.location && (
                      <div className="text-brand-cream-muted/40 text-xs font-sans mt-0.5">
                        {featured.location}
                      </div>
                    )}
                  </div>
                  <div className="w-6 h-px bg-brand-black-border" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-brand-gold/40" />
                    <span className="text-brand-cream-muted/25 text-[9px] uppercase tracking-[0.3em] font-sans">
                      {isFr ? 'Vérifié' : 'Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Secondary testimonials ── */}
        {rest.length > 0 && (
          <div className="border-t border-brand-black-border pt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-brand-black-border">
              {rest.slice(0, 3).map((testimonial) => {
                const initials = testimonial.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div key={testimonial.id} className="px-0 sm:px-8 py-8 sm:py-0 first:pl-0 last:pr-0 flex flex-col">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${i < testimonial.stars ? 'text-brand-gold' : 'text-brand-black-border'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <p className="text-brand-cream-muted/65 text-sm leading-relaxed font-light mb-7 flex-1">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>

                    {/* Gold accent divider */}
                    <div className="w-5 h-px bg-brand-gold/25 mb-5" />

                    {/* Client */}
                    <div className="flex items-center gap-3">
                      {testimonial.photoUrl ? (
                        <Image
                          src={testimonial.photoUrl}
                          alt={testimonial.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-cover grayscale flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 border border-brand-black-border flex items-center justify-center flex-shrink-0">
                          <span className="font-display text-sm text-brand-cream-muted/40 leading-none">
                            {initials}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-brand-cream text-xs font-sans font-semibold">
                          {testimonial.name}
                        </div>
                        {testimonial.location && (
                          <div className="text-brand-cream-muted/30 text-[10px] font-sans mt-0.5">
                            {testimonial.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
