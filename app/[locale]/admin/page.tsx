import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { Calendar, Clock, TrendingUp, CalendarDays, Wrench, Tag, Images, FileText, Settings, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import StatusBadge from '@/components/admin/StatusBadge';

interface AdminDashboardProps {
  params: { locale: string };
}

export async function generateMetadata() {
  return { title: 'Dashboard — Admin Éclat Auto' };
}

export default async function AdminDashboard({ params: { locale } }: AdminDashboardProps) {
  setRequestLocale(locale);
  const session = await getAdminSession();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Week start (Monday) and end (Sunday)
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  // Month boundaries for revenue
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [todayCount, pendingCount, pendingQuotesCount, weekReservations, monthRevenue, recent, services] = await Promise.all([
    prisma.reservation.count({ where: { date: todayStr } }),
    prisma.reservation.count({ where: { status: 'pending' } }),
    prisma.quote.count({ where: { status: 'pending' } }),
    prisma.reservation.findMany({
      where: { date: { gte: weekStartStr, lte: weekEndStr } },
      select: { id: true },
    }),
    prisma.reservation.aggregate({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        status: { not: 'cancelled' },
      },
      _sum: { price: true },
    }),
    prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        service: true,
        date: true,
        timeSlot: true,
        status: true,
        confirmationNumber: true,
      },
    }),
    prisma.service.findMany({ select: { id: true, nameFr: true } }),
  ]);

  const weekCount = weekReservations.length;
  const revenue = monthRevenue._sum.price ?? 0;

  const quickLinks = [
    { label: 'Réservations', href: `/${locale}/admin/reservations`, icon: CalendarDays, desc: 'Gérer les réservations' },
    { label: 'Services', href: `/${locale}/admin/services`, icon: Wrench, desc: 'Prix et services offerts' },
    { label: 'Promotions', href: `/${locale}/admin/promotions`, icon: Tag, desc: 'Rabais et offres spéciales' },
    { label: 'Galerie', href: `/${locale}/admin/gallery`, icon: Images, desc: 'Photos du site' },
    { label: 'Contenu', href: `/${locale}/admin/content`, icon: FileText, desc: 'Héro, témoignages, FAQ' },
    { label: 'Suppléments', href: `/${locale}/admin/supplements`, icon: Wrench, desc: 'Options additionnelles' },
    { label: 'Devis', href: `/${locale}/admin/quotes`, icon: CalendarDays, desc: 'Demandes de soumission' },
    { label: 'Paramètres', href: `/${locale}/admin/settings`, icon: Settings, desc: 'Coordonnées et options' },
  ];

  const SERVICE_NAMES: Record<string, string> = Object.fromEntries(services.map((s) => [s.id, s.nameFr]));

  return (
    <AdminShell locale={locale}>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-cream">
          Bonjour, {session?.user?.name?.split(' ')[0] ?? 'Admin'}
        </h1>
        <p className="text-brand-cream-muted text-sm mt-1">Voici un aperçu de votre activité</p>
      </div>

      {/* Pending alert banner */}
      {pendingCount > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-5 py-4">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-300 text-sm flex-1">
            <span className="font-semibold">{pendingCount} réservation{pendingCount > 1 ? 's' : ''} en attente</span>
            {' '}— une action est requise.
          </p>
          <Link
            href={`/${locale}/admin/reservations?status=pending`}
            className="text-yellow-400 text-sm font-medium hover:text-yellow-300 transition-colors whitespace-nowrap"
          >
            Voir →
          </Link>
        </div>
      )}

      {/* Pending quotes alert */}
      {pendingQuotesCount > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-5 py-4">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <p className="text-blue-300 text-sm flex-1">
            <span className="font-semibold">{pendingQuotesCount} demande{pendingQuotesCount > 1 ? 's' : ''} de devis en attente</span>
            {' '}— soumission à envoyer.
          </p>
          <Link
            href={`/${locale}/admin/quotes`}
            className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors whitespace-nowrap"
          >
            Voir →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Today */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-brand-cream-muted text-sm">Réservations aujourd'hui</p>
            <Calendar className="w-5 h-5 text-brand-gold" />
          </div>
          <p className="text-4xl font-bold text-brand-gold">{todayCount}</p>
          <p className="text-brand-cream-muted/50 text-xs mt-2">{todayStr}</p>
        </div>

        {/* Pending */}
        <div className={`card-dark p-6 ${pendingCount > 0 ? 'border border-yellow-500/20' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-brand-cream-muted text-sm">En attente</p>
            <Clock className={`w-5 h-5 ${pendingCount > 0 ? 'text-yellow-400' : 'text-brand-cream-muted'}`} />
          </div>
          <p className={`text-4xl font-bold ${pendingCount > 0 ? 'text-yellow-400' : 'text-brand-cream'}`}>
            {pendingCount}
          </p>
          <p className="text-brand-cream-muted/50 text-xs mt-2">Nécessitent une action</p>
        </div>

        {/* This week */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-brand-cream-muted text-sm">Cette semaine</p>
            <CalendarDays className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-blue-400">{weekCount}</p>
          <p className="text-brand-cream-muted/50 text-xs mt-2">Lun – Dim</p>
        </div>

        {/* Monthly revenue */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-brand-cream-muted text-sm">Revenus estimés ce mois</p>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-4xl font-bold text-green-400">{revenue}$</p>
          <p className="text-brand-cream-muted/50 text-xs mt-2">
            {now.toLocaleString('fr-CA', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-brand-cream mb-4">Accès rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="card-dark p-4 flex flex-col items-center text-center gap-2 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all group border border-brand-black-border rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-black flex items-center justify-center group-hover:bg-brand-gold/10 transition-colors">
                <Icon className="w-5 h-5 text-brand-gold" />
              </div>
              <span className="text-brand-cream text-sm font-medium">{label}</span>
              <span className="text-brand-cream-muted/60 text-xs leading-tight">{desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="card-dark p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-semibold text-brand-cream">Réservations récentes</h2>
          <Link
            href={`/${locale}/admin/reservations`}
            className="text-brand-gold text-sm hover:text-brand-gold/80 transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        {/* Mobile: card list */}
        <div className="md:hidden space-y-3">
          {recent.length === 0 && (
            <p className="py-6 text-center text-brand-cream-muted text-sm">Aucune réservation</p>
          )}
          {recent.map((r) => (
            <Link
              key={r.id}
              href={`/${locale}/admin/reservations`}
              className="flex items-center justify-between gap-3 py-3 border-b border-brand-black-border/50 last:border-0"
            >
              <div className="min-w-0">
                <div className="text-brand-cream text-sm font-medium">{r.firstName} {r.lastName}</div>
                <div className="text-brand-cream-muted text-xs mt-0.5 truncate">
                  {SERVICE_NAMES[r.service] ?? r.service} · {r.date}
                </div>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-black-border">
                <th className="text-left text-brand-cream-muted text-xs font-medium uppercase tracking-wider pb-3">Client</th>
                <th className="text-left text-brand-cream-muted text-xs font-medium uppercase tracking-wider pb-3">Service</th>
                <th className="text-left text-brand-cream-muted text-xs font-medium uppercase tracking-wider pb-3">Date</th>
                <th className="text-left text-brand-cream-muted text-xs font-medium uppercase tracking-wider pb-3">Confirmation</th>
                <th className="text-left text-brand-cream-muted text-xs font-medium uppercase tracking-wider pb-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-black-border">
              {recent.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 text-brand-cream text-sm font-medium">
                    {r.firstName} {r.lastName}
                  </td>
                  <td className="py-3 text-brand-cream-muted text-sm">
                    {SERVICE_NAMES[r.service] ?? r.service}
                  </td>
                  <td className="py-3">
                    <div className="text-brand-cream-muted text-sm">{r.date}</div>
                    <div className="text-brand-cream-muted/50 text-xs">{r.timeSlot}</div>
                  </td>
                  <td className="py-3 text-brand-cream-muted/60 text-xs font-mono">
                    {r.confirmationNumber ?? '—'}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-cream-muted">
                    Aucune réservation
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
