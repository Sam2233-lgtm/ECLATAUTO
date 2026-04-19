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
    <section id="testimonials" className="bg-brand-black section-pad relative overflow-hidden">
      {/* Blue accent glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-16">
          <span className="eyebrow">{isFr ? 'Témoignages' : 'Testimonials'}</span>
          <div className="flex-1 h-px bg-brand-black-border" />
          <span className="text-brand-cream-muted/30 text-xs font-sans tabular-nums">
            {testimonials.length.toString().padStart(2, '0')}
          </span>
        </div>

        {/* ── Featured — grande citation ── */}
        {featured && (
          <div className="mb-16 lg:mb-20">
            {/* Stars */}
            <div className="flex items-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < featured.stars ? 'text-brand-gold' : 'text-brand-black-border'}`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Big quote */}
            <blockquote className="font-display text-[clamp(2rem,5vw,4rem)] text-brand-cream leading-tight mb-8 max-w-4xl">
              &ldquo;{featured.text}&rdquo;
            </blockquote>

            {/* Client */}
            <div className="flex items-center gap-4">
              {featured.photoUrl ? (
                <Image
                  src={featured.photoUrl}
                  alt={featured.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover grayscale"
                />
              ) : (
                <div className="w-12 h-12 bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-xl text-brand-gold">
                    {featured.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
              )}
              <div>
                <div className="text-brand-cream font-sans font-semibold text-sm">{featured.name}</div>
                <div className="text-brand-cream-muted/50 text-xs font-sans">{featured.location}</div>
              </div>
              <div className="ml-4 h-px flex-1 bg-brand-black-border max-w-[120px]" />
            </div>
          </div>
        )}

        {/* ── Secondary testimonials — liste horizontale ── */}
        {rest.length > 0 && (
          <div className="border-t border-brand-black-border pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-brand-black-border">
            {rest.slice(0, 3).map((testimonial) => {
              const initials = testimonial.name
                .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

              return (
                <div key={testimonial.id} className="px-0 sm:px-8 py-8 sm:py-0 first:pl-0 last:pr-0">
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${i < testimonial.stars ? 'text-brand-gold' : 'text-brand-black-border'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="text-brand-cream-muted text-sm leading-relaxed mb-6 font-light">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

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
                        <span className="font-display text-sm text-brand-gold">{initials}</span>
                      </div>
                    )}
                    <div>
                      <div className="text-brand-cream text-xs font-sans font-semibold">{testimonial.name}</div>
                      <div className="text-brand-cream-muted/40 text-[10px] font-sans">{testimonial.location}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
