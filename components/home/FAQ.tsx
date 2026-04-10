import { getActiveFAQs } from '@/lib/db-services';
import FAQAccordion from './FAQAccordion';

interface FAQProps {
  locale: string;
}

export default async function FAQ({ locale }: FAQProps) {
  const faqs = await getActiveFAQs();
  if (faqs.length === 0) return null;

  const isFr = locale === 'fr';

  return (
    <section id="faq" className="py-24 px-4 bg-brand-black-soft">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-sm font-semibold uppercase tracking-widest">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-cream mt-2">
            {isFr ? 'Questions fréquentes' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-brand-cream-muted mt-3 max-w-xl mx-auto">
            {isFr
              ? 'Tout ce que vous devez savoir sur notre service de détailing à domicile'
              : 'Everything you need to know about our mobile detailing service'}
          </p>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto mt-4" />
        </div>

        <FAQAccordion faqs={faqs} locale={locale} />
      </div>
    </section>
  );
}
