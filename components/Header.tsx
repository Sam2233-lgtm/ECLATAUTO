'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-brand-black/95 backdrop-blur-md border-b border-brand-black-border shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-gold rounded-md flex items-center justify-center">
              <span className="text-brand-black font-black text-sm">É</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-brand-gold">Éclat</span>
              <span className="text-brand-cream"> Auto</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand-cream-muted hover:text-brand-cream text-sm font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switcher */}
            <Link
              href={switchPath}
              className="text-brand-cream-muted hover:text-brand-gold text-sm font-medium transition-colors uppercase"
            >
              {otherLocale}
            </Link>

            <Link href={`/${locale}/reservation`} className="btn-gold text-sm py-2 px-5">
              {t('reservation')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-brand-cream p-2"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-black-soft border-t border-brand-black-border">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-brand-cream-muted hover:text-brand-cream py-2 font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-brand-black-border flex items-center gap-3">
              <Link
                href={switchPath}
                className="text-brand-cream-muted hover:text-brand-gold text-sm font-medium uppercase"
              >
                {otherLocale}
              </Link>
              <Link
                href={`/${locale}/reservation`}
                onClick={() => setMobileOpen(false)}
                className="btn-gold text-sm py-2 px-4 flex-1 text-center"
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
