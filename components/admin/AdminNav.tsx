'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, CalendarDays, LogOut, Settings, Images,
  Tag, Wrench, FileText, CalendarX, Car, PlusCircle, ClipboardList, X, Layers, RotateCcw, QrCode,
} from 'lucide-react';
import type { Session } from 'next-auth';

interface AdminNavProps {
  locale: string;
  session: Session;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function AdminNav({ locale, session, mobileOpen = false, onClose }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard',                                            href: `/${locale}/admin`,                  icon: LayoutDashboard, exact: true },
    { label: locale === 'fr' ? 'Réservations' : 'Reservations',    href: `/${locale}/admin/reservations`,       icon: CalendarDays },
    { label: locale === 'fr' ? 'Services' : 'Services',            href: `/${locale}/admin/service-cards`,      icon: Layers },
    { label: locale === 'fr' ? 'Maintien' : 'Maintenance',         href: `/${locale}/admin/maintenance-plans`,  icon: RotateCcw },
    { label: locale === 'fr' ? 'Services (avancé)' : 'Services (adv)', href: `/${locale}/admin/services`,      icon: Wrench },
    { label: locale === 'fr' ? 'Suppléments' : 'Supplements',      href: `/${locale}/admin/supplements`,      icon: PlusCircle },
    { label: locale === 'fr' ? 'Véhicules' : 'Vehicles',           href: `/${locale}/admin/vehicle-categories`, icon: Car },
    { label: 'Promotions',                                           href: `/${locale}/admin/promotions`,       icon: Tag },
    { label: locale === 'fr' ? 'Devis' : 'Quotes',                 href: `/${locale}/admin/quotes`,           icon: ClipboardList },
    { label: 'Galerie',                                              href: `/${locale}/admin/gallery`,          icon: Images },
    { label: locale === 'fr' ? 'Contenu' : 'Content',              href: `/${locale}/admin/content`,          icon: FileText },
    { label: locale === 'fr' ? 'Dates bloquées' : 'Blocked Dates', href: `/${locale}/admin/blocked-dates`,    icon: CalendarX },
    { label: locale === 'fr' ? 'Paramètres' : 'Settings',          href: `/${locale}/admin/settings`,         icon: Settings },
  ];

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const sidebarContent = (
    <aside className="h-full flex flex-col">
      {/* Logo + close button (mobile) */}
      <div className="p-5 border-b border-brand-black-border flex items-center justify-between">
        <Link href={`/${locale}/admin`} className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 bg-brand-gold flex items-center justify-center flex-shrink-0">
            <span className="text-brand-black font-black text-sm">É</span>
          </div>
          <div>
            <div className="text-sm font-bold text-brand-cream leading-none">Éclat Auto</div>
            <div className="text-xs text-brand-cream-muted mt-0.5">Admin</div>
          </div>
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 text-brand-cream-muted hover:text-brand-cream transition-colors"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive({ href, exact });
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                  : 'text-brand-cream-muted hover:text-brand-cream hover:bg-white/5 border border-transparent'
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="p-3 border-t border-brand-black-border space-y-1">
        <div className="px-3 py-2">
          <div className="text-[10px] text-brand-cream-muted/60 uppercase tracking-wider mb-0.5">Connecté</div>
          <div className="text-sm font-medium text-brand-cream truncate">{session.user?.name}</div>
          <div className="text-xs text-brand-cream-muted/60 truncate">{session.user?.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/admin/login` })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {locale === 'fr' ? 'Déconnexion' : 'Sign Out'}
        </button>
        <Link
          href={`/${locale}`}
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-brand-cream-muted/50 hover:text-brand-cream-muted transition-colors"
        >
          ← {locale === 'fr' ? 'Retour au site' : 'Back to site'}
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop sidebar (always visible md+) ── */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-brand-black-soft border-r border-brand-black-border flex-col z-40">
        {sidebarContent}
      </div>

      {/* ── Mobile sidebar (slide-in) ── */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`md:hidden fixed left-0 top-0 h-screen w-72 max-w-[85vw] bg-brand-black-soft border-r border-brand-black-border z-50 flex flex-col transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
