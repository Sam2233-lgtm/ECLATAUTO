'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import type { Session } from 'next-auth';
import AdminNav from './AdminNav';

interface AdminLayoutClientProps {
  locale: string;
  session: Session;
  children: React.ReactNode;
}

export default function AdminLayoutClient({ locale, session, children }: AdminLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-black">
      <AdminNav
        locale={locale}
        session={session}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="md:ml-64 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-brand-black-soft border-b border-brand-black-border flex items-center gap-3 px-4 h-14 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 text-brand-cream-muted hover:text-brand-cream transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-brand-cream font-semibold text-sm">Éclat Auto Admin</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
