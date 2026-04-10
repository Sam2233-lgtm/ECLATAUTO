'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: string;
  questionFr: string;
  questionEn: string;
  answerFr: string;
  answerEn: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  locale: string;
}

export default function FAQAccordion({ faqs, locale }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const isFr = locale === 'fr';

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-0 border border-brand-black-border rounded-2xl overflow-hidden">
      {faqs.map((faq, index) => {
        const isOpen = openId === faq.id;
        const question = isFr ? faq.questionFr : faq.questionEn;
        const answer = isFr ? faq.answerFr : faq.answerEn;
        const isLast = index === faqs.length - 1;

        return (
          <div key={faq.id} className={!isLast ? 'border-b border-brand-gold/20' : ''}>
            <button
              onClick={() => toggle(faq.id)}
              className="w-full flex items-center justify-between px-6 py-5 text-left bg-brand-black-card hover:bg-white/5 transition-colors duration-200"
              aria-expanded={isOpen}
            >
              <span className="text-brand-cream font-semibold pr-4">{question}</span>
              <ChevronDown
                className={`w-5 h-5 text-brand-gold flex-shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-5 pt-1 bg-brand-black-card">
                <p className="text-brand-cream-muted text-sm leading-relaxed">{answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
