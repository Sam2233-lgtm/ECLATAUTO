'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronDown, Trash2, X, Save, Check, Phone, Mail, MapPin, Clock, Car } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { RESERVATION_STATUSES, type ReservationStatus } from '@/lib/constants';

interface Reservation {
  id: string;
  confirmationNumber?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  vehicleType: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  date: string;
  timeSlot: string;
  status: string;
  city: string;
  address?: string;
  postalCode?: string;
  notes?: string | null;
  internalNote?: string | null;
  supplements?: Array<{ id: string; nameFr: string; nameEn: string; price: number }> | null;
  price?: number;
  createdAt: Date;
}

interface ReservationsTableProps {
  reservations: Reservation[];
  locale: string;
  activeStatus: string;
  serviceNames?: Record<string, string>;
}

const VEHICLE_NAMES: Record<string, string> = {
  compact: 'Compact',
  sedan: 'Berline',
  suv: 'SUV',
  truck: 'Camionnette',
  van: 'Fourgonnette',
};

const FILTER_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;

export default function ReservationsTable({ reservations, locale, activeStatus, serviceNames = {} }: ReservationsTableProps) {
  const t = useTranslations('admin.reservations');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteError, setNoteError] = useState('');

  const FILTER_LABELS: Record<string, string> = {
    all: t('filter.all'),
    pending: t('filter.pending'),
    confirmed: t('filter.confirmed'),
    completed: t('filter.completed'),
    cancelled: t('filter.cancelled'),
  };

  function openDetail(r: Reservation) {
    setSelectedReservation(r);
    setInternalNote(r.internalNote ?? '');
    setNoteSaved(false);
    setNoteError('');
  }

  function closeDetail() {
    setSelectedReservation(null);
  }

  async function updateStatus(id: string, status: ReservationStatus) {
    setUpdatingId(id);
    try {
      await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (selectedReservation?.id === id) {
        setSelectedReservation((prev) => prev ? { ...prev, status } : prev);
      }
      startTransition(() => router.refresh());
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteReservation(id: string) {
    if (!confirm(locale === 'fr' ? 'Supprimer cette réservation?' : 'Delete this reservation?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/reservations/${id}`, { method: 'DELETE' });
      if (selectedReservation?.id === id) closeDetail();
      startTransition(() => router.refresh());
    } finally {
      setDeletingId(null);
    }
  }

  async function saveInternalNote() {
    if (!selectedReservation) return;
    setSavingNote(true);
    setNoteError('');
    setNoteSaved(false);
    try {
      const res = await fetch(`/api/admin/reservations/${selectedReservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNote }),
      });
      if (!res.ok) throw new Error();
      setNoteSaved(true);
      setSelectedReservation((prev) => prev ? { ...prev, internalNote } : prev);
      setTimeout(() => setNoteSaved(false), 3000);
      startTransition(() => router.refresh());
    } catch {
      setNoteError('Erreur lors de la sauvegarde.');
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div className="relative">
      {/* ── Filter tabs ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTER_TABS.map((status) => (
          <Link
            key={status}
            href={`/${locale}/admin/reservations${status !== 'all' ? `?status=${status}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
              ${activeStatus === status
                ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/30'
                : 'text-brand-cream-muted border-brand-black-border hover:border-brand-gold/20 hover:text-brand-cream'
              }`}
          >
            {FILTER_LABELS[status]}
          </Link>
        ))}
      </div>

      {/* ── MOBILE: Card list (hidden on md+) ── */}
      <div className="md:hidden space-y-3">
        {reservations.length === 0 && (
          <div className="card-dark p-8 text-center text-brand-cream-muted text-sm">
            {t('noReservations')}
          </div>
        )}
        {reservations.map((r) => (
          <div
            key={r.id}
            className={`card-dark border border-brand-black-border rounded-xl overflow-hidden transition-opacity ${
              deletingId === r.id ? 'opacity-40' : ''
            }`}
          >
            {/* Card header */}
            <button
              className="w-full text-left px-4 pt-4 pb-3 flex items-start justify-between gap-3"
              onClick={() => openDetail(r)}
            >
              <div className="min-w-0">
                <div className="text-brand-cream font-semibold text-sm">
                  {r.firstName} {r.lastName}
                </div>
                <div className="text-brand-cream-muted text-xs mt-0.5 truncate">
                  {serviceNames[r.service] ?? r.service}
                </div>
              </div>
              <StatusBadge status={r.status} locale={locale} />
            </button>

            {/* Card info rows */}
            <div className="px-4 pb-3 space-y-1.5 text-xs text-brand-cream-muted border-t border-brand-black-border/50 pt-3">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <span className="text-brand-cream">{r.date}</span>
                <span>—</span>
                <span>{r.timeSlot}</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-3.5 h-3.5 flex-shrink-0" />
                {VEHICLE_NAMES[r.vehicleType] ?? r.vehicleType}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {r.city}
              </div>
            </div>

            {/* Card footer: actions */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-brand-black-border/50 bg-white/[0.02]">
              {/* Quick call */}
              <a
                href={`tel:${r.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-gold/10 text-brand-gold text-xs font-medium hover:bg-brand-gold/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Appeler
              </a>

              {/* Status select */}
              <div className="relative flex-1">
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value as ReservationStatus)}
                  disabled={updatingId === r.id}
                  className="w-full appearance-none bg-brand-black-soft border border-brand-black-border rounded-lg px-3 py-2 pr-7 text-xs text-brand-cream-muted
                             focus:outline-none focus:border-brand-gold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {RESERVATION_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-brand-black-soft">
                      {FILTER_LABELS[s]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-cream-muted pointer-events-none" />
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteReservation(r.id)}
                disabled={deletingId === r.id}
                className="p-2 rounded-lg text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP: Table (hidden on mobile) ── */}
      <div className="hidden md:block card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-brand-black-border">
              <tr>
                {[t('client'), t('service'), t('vehicle'), t('datetime'), t('status'), t('actions')].map((h) => (
                  <th key={h} className="text-left text-brand-cream-muted text-xs font-medium uppercase tracking-wider px-5 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-black-border">
              {reservations.map((r) => (
                <tr
                  key={r.id}
                  className={`hover:bg-white/5 transition-colors cursor-pointer ${
                    deletingId === r.id ? 'opacity-40' : ''
                  } ${selectedReservation?.id === r.id ? 'bg-brand-gold/5' : ''}`}
                  onClick={() => openDetail(r)}
                >
                  <td className="px-5 py-4">
                    <div className="text-brand-cream text-sm font-medium">{r.firstName} {r.lastName}</div>
                    <div className="text-brand-cream-muted text-xs">{r.email}</div>
                    <div className="text-brand-cream-muted/60 text-xs">{r.city}</div>
                  </td>
                  <td className="px-5 py-4 text-brand-cream-muted text-sm">
                    {serviceNames[r.service] ?? r.service}
                  </td>
                  <td className="px-5 py-4 text-brand-cream-muted text-sm">
                    {VEHICLE_NAMES[r.vehicleType] ?? r.vehicleType}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-brand-cream text-sm">{r.date}</div>
                    <div className="text-brand-cream-muted text-xs">{r.timeSlot}</div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={r.status} locale={locale} />
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select
                          value={r.status}
                          onChange={(e) => updateStatus(r.id, e.target.value as ReservationStatus)}
                          disabled={updatingId === r.id}
                          className="appearance-none bg-brand-black-soft border border-brand-black-border rounded-lg px-3 py-1.5 pr-7 text-xs text-brand-cream-muted
                                     hover:border-brand-gold/40 focus:outline-none focus:border-brand-gold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {RESERVATION_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-brand-black-soft">
                              {FILTER_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-cream-muted pointer-events-none" />
                      </div>
                      <button
                        onClick={() => deleteReservation(r.id)}
                        disabled={deletingId === r.id}
                        className="p-1.5 rounded-lg text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        title={locale === 'fr' ? 'Supprimer' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-brand-cream-muted">
                    {t('noReservations')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail panel overlay (shared desktop + mobile) ── */}
      {selectedReservation && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 z-40" onClick={closeDetail} />

          {/* Slide-in panel */}
          <div className="fixed right-0 top-0 h-screen w-full max-w-lg bg-brand-black-soft border-l border-brand-black-border z-50 flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-black-border flex-shrink-0">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-brand-cream leading-none">
                  {selectedReservation.firstName} {selectedReservation.lastName}
                </h2>
                {selectedReservation.confirmationNumber && (
                  <p className="text-brand-cream-muted/60 text-xs font-mono mt-1">
                    #{selectedReservation.confirmationNumber}
                  </p>
                )}
              </div>
              <button
                onClick={closeDetail}
                className="p-2 rounded-lg text-brand-cream-muted hover:text-brand-cream hover:bg-white/5 transition-all flex-shrink-0 ml-3"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Status */}
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={selectedReservation.status} locale={locale} />
                <div className="relative">
                  <select
                    value={selectedReservation.status}
                    onChange={(e) => updateStatus(selectedReservation.id, e.target.value as ReservationStatus)}
                    disabled={updatingId === selectedReservation.id}
                    className="appearance-none bg-brand-black border border-brand-black-border rounded-lg px-3 py-1.5 pr-7 text-xs text-brand-cream-muted
                               hover:border-brand-gold/40 focus:outline-none focus:border-brand-gold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {RESERVATION_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-brand-black-soft">
                        {s === 'pending' ? 'En attente' : s === 'confirmed' ? 'Confirmée' : s === 'completed' ? 'Complétée' : 'Annulée'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-cream-muted pointer-events-none" />
                </div>
              </div>

              {/* Quick actions — mobile friendly */}
              <div className="flex flex-wrap gap-2">
                <a
                  href={`tel:${selectedReservation.phone}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-gold/10 text-brand-gold text-sm font-medium hover:bg-brand-gold/20 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {selectedReservation.phone}
                </a>
                <a
                  href={`mailto:${selectedReservation.email}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-brand-cream-muted text-sm hover:bg-white/10 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {locale === 'fr' ? 'Courriel' : 'Email'}
                </a>
              </div>

              {/* Client info */}
              <div>
                <h3 className="text-xs font-semibold text-brand-cream-muted uppercase tracking-wider mb-2">
                  Informations client
                </h3>
                <div className="bg-brand-black rounded-xl divide-y divide-brand-black-border/50">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-brand-cream-muted text-xs">Nom</span>
                    <span className="text-brand-cream text-sm font-medium">
                      {selectedReservation.firstName} {selectedReservation.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-brand-cream-muted text-xs">Adresse</span>
                    <span className="text-brand-cream text-sm text-right max-w-[200px] leading-snug">
                      {selectedReservation.address}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-brand-cream-muted text-xs">Ville</span>
                    <span className="text-brand-cream text-sm">{selectedReservation.city}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle info */}
              <div>
                <h3 className="text-xs font-semibold text-brand-cream-muted uppercase tracking-wider mb-2">
                  Véhicule
                </h3>
                <div className="bg-brand-black rounded-xl divide-y divide-brand-black-border/50">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-brand-cream-muted text-xs">Type</span>
                    <span className="text-brand-cream text-sm">
                      {VEHICLE_NAMES[selectedReservation.vehicleType] ?? selectedReservation.vehicleType}
                    </span>
                  </div>
                  {selectedReservation.vehicleMake && (
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-brand-cream-muted text-xs">Marque</span>
                      <span className="text-brand-cream text-sm">{selectedReservation.vehicleMake}</span>
                    </div>
                  )}
                  {selectedReservation.vehicleModel && (
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-brand-cream-muted text-xs">Modèle</span>
                      <span className="text-brand-cream text-sm">{selectedReservation.vehicleModel}</span>
                    </div>
                  )}
                  {selectedReservation.vehicleYear && (
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-brand-cream-muted text-xs">Année</span>
                      <span className="text-brand-cream text-sm">{selectedReservation.vehicleYear}</span>
                    </div>
                  )}
                  {selectedReservation.vehicleColor && (
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-brand-cream-muted text-xs">Couleur</span>
                      <span className="text-brand-cream text-sm">{selectedReservation.vehicleColor}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reservation info */}
              <div>
                <h3 className="text-xs font-semibold text-brand-cream-muted uppercase tracking-wider mb-2">
                  Réservation
                </h3>
                <div className="bg-brand-black rounded-xl divide-y divide-brand-black-border/50">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-brand-cream-muted text-xs">Service</span>
                    <span className="text-brand-cream text-sm text-right max-w-[200px]">
                      {serviceNames[selectedReservation.service] ?? selectedReservation.service}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-brand-cream-muted text-xs">Date</span>
                    <span className="text-brand-cream text-sm">{selectedReservation.date}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-brand-cream-muted text-xs">Heure</span>
                    <span className="text-brand-cream text-sm">{selectedReservation.timeSlot}</span>
                  </div>
                  {selectedReservation.price !== undefined && selectedReservation.price > 0 && (
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-brand-cream-muted text-xs">Prix total</span>
                      <span className="text-brand-gold text-sm font-semibold">{selectedReservation.price}$</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Supplements */}
              {selectedReservation.supplements && (selectedReservation.supplements as Array<{ nameFr: string; nameEn: string; price: number }>).length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-brand-cream-muted uppercase tracking-wider mb-2">
                    Suppléments
                  </h3>
                  <div className="bg-brand-black rounded-xl divide-y divide-brand-black-border/50">
                    {(selectedReservation.supplements as Array<{ nameFr: string; nameEn: string; price: number }>).map((s, i) => (
                      <div key={i} className="flex justify-between items-center px-4 py-3">
                        <span className="text-brand-cream text-sm">{s.nameFr}</span>
                        <span className="text-brand-gold text-sm font-semibold">+{s.price}$</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client notes */}
              {selectedReservation.notes && (
                <div>
                  <h3 className="text-xs font-semibold text-brand-cream-muted uppercase tracking-wider mb-2">
                    Notes du client
                  </h3>
                  <div className="bg-brand-black rounded-xl px-4 py-3">
                    <p className="text-brand-cream text-sm leading-relaxed">{selectedReservation.notes}</p>
                  </div>
                </div>
              )}

              {/* Internal note */}
              <div>
                <h3 className="text-xs font-semibold text-brand-cream-muted uppercase tracking-wider mb-2">
                  Note interne
                </h3>
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  rows={3}
                  placeholder="Note visible uniquement par l'équipe admin..."
                  className="w-full bg-brand-black border border-brand-black-border rounded-xl px-4 py-3 text-brand-cream text-sm
                             placeholder:text-brand-cream-muted/40 focus:outline-none focus:border-brand-gold/40 resize-none transition-colors"
                />
                {noteError && <p className="text-red-400 text-xs mt-1">{noteError}</p>}
                <button
                  onClick={saveInternalNote}
                  disabled={savingNote}
                  className="mt-2 btn-gold flex items-center gap-2 text-sm py-2.5 disabled:opacity-60"
                >
                  {savingNote ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
                  ) : noteSaved ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {noteSaved ? 'Sauvegardé!' : 'Sauvegarder la note'}
                </button>
              </div>
            </div>

            {/* Panel footer */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-brand-black-border">
              <button
                onClick={() => deleteReservation(selectedReservation.id)}
                disabled={deletingId === selectedReservation.id}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer cette réservation
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
