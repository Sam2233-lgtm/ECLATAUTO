'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck } from 'lucide-react';

interface MobileBookingButtonProps {
  locale: string;
}

export default function MobileBookingButton({ locale }: MobileBookingButtonProps) {
  const pathname = usePathname();

  // Hide on reservation page (wizard already has its own bottom bar)
  if (pathname.includes('/reservation')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 py-3 bg-brand-black/95 backdrop-blur-md border-t border-brand-black-border safe-area-bottom">
      <Link
        href={`/${locale}/reservation`}
        className="btn-gold w-full flex items-center justify-center gap-2 min-h-[52px] text-base font-bold rounded-xl"
      >
        <CalendarCheck className="w-5 h-5" />
        {locale === 'fr' ? 'Réserver maintenant' : 'Book Now'}
      </Link>
    </div>
  );
}
