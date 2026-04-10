'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, CalendarDays, LogOut, Settings, Images, Tag, Wrench, FileText, CalendarX } from 'lucide-react';
import type { Session } from 'next-auth';

interface AdminNavProps {
  locale: string;
  session: Session;
}

export default function AdminNav({ locale, session }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: `/${locale}/admin`, icon: LayoutDashboard, exact: true },
    { label: locale === 'fr' ? 'Réservations' : 'Reservations', href: `/${locale}/admin/reservations`, icon: CalendarDays },
    { label: 'Services', href: `/${locale}/admin/services`, icon: Wrench },
    { label: 'Promotions', href: `/${locale}/admin/promotions`, icon: Tag },
    { label: 'Galerie', href: `/${locale}/admin/gallery`, icon: Images },
    { label: locale === 'fr' ? 'Contenu' : 'Content', href: `/${locale}/admin/content`, icon: FileText },
    { label: locale === 'fr' ? 'Dates bloquées' : 'Blocked Dates', href: `/${locale}/admin/blocked-dates`, icon: CalendarX },
    { label: locale === 'fr' ? 'Paramètres' : 'Settings', href: `/${locale}/admin/settings`, icon: Settings },
  ];

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-brand-black-soft border-r border-brand-black-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-brand-black-border">
        <Link href={`/${locale}/admin`} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-gold rounded-md flex items-center justify-center">
            <span className="text-brand-black font-black text-sm">É</span>
          </div>
          <div>
            <div className="text-sm font-bold text-brand-cream">Éclat Auto</div>
            <div className="text-xs text-brand-cream-muted">Admin</div>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive({ href, exact });
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
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
      <div className="p-4 border-t border-brand-black-border">
        <div className="mb-3 px-3">
          <div className="text-xs text-brand-cream-muted">Connecté en tant que</div>
          <div className="text-sm font-medium text-brand-cream truncate">{session.user?.name}</div>
          <div className="text-xs text-brand-cream-muted/70 truncate">{session.user?.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/admin/login` })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          {locale === 'fr' ? 'Déconnexion' : 'Sign Out'}
        </button>
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-brand-cream-muted/60 hover:text-brand-cream-muted transition-colors mt-1"
        >
          ← {locale === 'fr' ? 'Retour au site' : 'Back to site'}
        </Link>
      </div>
    </aside>
  );
}
