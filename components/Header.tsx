'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const otherLocale = locale === 'fr' ? 'en' : 'fr';
  const switchPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  const navLinks = [
    { label: t('home'), href: `/${locale}` },
    { label: t('services'), href: `/${locale}#services` },
    { label: t('about'), href: `/${locale}#why-us` },
    { label: t('contact'), href: `/${locale}#contact` },
    { label: t('suivi'), href: `/${locale}/suivi` },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-brand-black/98 backdrop-blur-md border-b border-brand-black-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <Image
              src="/logo.png"
              alt="Éclat Auto"
              width={120}
              height={60}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand-cream-muted hover:text-brand-cream text-xs font-sans uppercase tracking-widest transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href={switchPath}
              className="text-brand-cream-muted hover:text-brand-gold text-xs font-sans uppercase tracking-widest transition-colors"
            >
              {otherLocale}
            </Link>
            <Link
              href={`/${locale}/reservation`}
              className="bg-brand-gold text-brand-black font-sans font-bold text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-brand-gold-light transition-colors duration-200"
            >
              {t('reservation')}
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-brand-cream p-2"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-black border-t border-brand-black-border">
          <div className="px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-brand-cream-muted hover:text-brand-cream font-sans text-xs uppercase tracking-widest py-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-brand-black-border flex items-center gap-4">
              <Link
                href={switchPath}
                className="text-brand-cream-muted hover:text-brand-gold text-xs font-sans uppercase tracking-widest transition-colors"
              >
                {otherLocale}
              </Link>
              <Link
                href={`/${locale}/reservation`}
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center bg-brand-gold text-brand-black font-sans font-bold text-xs uppercase tracking-widest px-4 py-3 hover:bg-brand-gold-light transition-colors"
              >
                {t('reservation')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
