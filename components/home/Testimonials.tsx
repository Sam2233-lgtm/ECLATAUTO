import Image from 'next/image';
import { getActiveTestimonials } from '@/lib/db-services';

interface TestimonialsProps {
  locale: string;
}

export default async function Testimonials({ locale }: TestimonialsProps) {
  const testimonials = await getActiveTestimonials();

  if (testimonials.length === 0) return null;

  const isFr = locale === 'fr';

  return (
    <section id="testimonials" className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-brand-black" />
      {/* Subtle gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-brand-gold text-sm font-semibold uppercase tracking-widest">
            {isFr ? 'Témoignages' : 'Testimonials'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-cream mt-2">
            {isFr ? 'Ce que disent nos clients' : 'What Our Clients Say'}
          </h2>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto mt-4" />
          <p className="text-brand-cream-muted text-lg mt-4 max-w-2xl mx-auto">
            {isFr
              ? 'Des centaines de clients satisfaits à travers le Grand Montréal'
              : 'Hundreds of happy clients across Greater Montreal'}
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => {
            const initials = testimonial.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={testimonial.id}
                className="card-dark p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-300 hover:border-brand-gold/30"
              >
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${i < testimonial.stars ? 'text-brand-gold' : 'text-brand-black-border'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-brand-cream-muted text-sm leading-relaxed italic flex-1">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* Client info */}
                <div className="flex items-center gap-3 pt-2 border-t border-brand-black-border">
                  {testimonial.photoUrl ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-brand-black-border">
                      <Image
                        src={testimonial.photoUrl}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                      <span className="text-brand-gold text-sm font-bold">{initials}</span>
                    </div>
                  )}
                  <div>
                    <div className="text-brand-cream font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-brand-cream-muted text-xs">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
