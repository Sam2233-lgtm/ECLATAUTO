'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Loader2, CalendarDays } from 'lucide-react';

interface ServiceCard {
  id: string;
  name: string;
  prices: { berline: number; vus: number; pickup: number; fourgonnette: number };
}

interface AddReservationModalProps {
  onClose: () => void;
}

const VEHICLE_TYPES = [
  { value: 'berline',      label: 'Berline' },
  { value: 'vus',          label: 'VUS' },
  { value: 'pickup',       label: 'Pick-up' },
  { value: 'fourgonnette', label: 'Fourgonnette' },
] as const;

const SOURCES = [
  { value: 'TELEPHONE', label: 'Téléphone' },
  { value: 'TEXTO',     label: 'Texto' },
] as const;

const TIME_SLOTS = [
  '08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00',
];

type VehicleType = typeof VEHICLE_TYPES[number]['value'];

export default function AddReservationModal({ onClose }: AddReservationModalProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [services, setServices] = useState<ServiceCard[]>([]);
  const [form, setForm] = useState({
    clientName:  '',
    clientPhone: '',
    clientEmail: '',
    service:     '',
    vehicleType: 'berline' as VehicleType,
    date:        '',
    timeSlot:    '09:00',
    price:       '',
    source:      'TELEPHONE' as typeof SOURCES[number]['value'],
    notes:       '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState('');

  // Load service cards
  useEffect(() => {
    fetch('/api/public/service-cards')
      .then((r) => r.json())
      .then((data: ServiceCard[]) => {
        if (!Array.isArray(data)) return;
        setServices(data);
        if (data.length > 0) setForm((f) => ({ ...f, service: data[0].id }));
      })
      .catch(() => {});
  }, []);

  // Auto-compute price when service or vehicleType changes
  useEffect(() => {
    const svc = services.find((s) => s.id === form.service);
    if (!svc) return;
    const p = svc.prices[form.vehicleType as keyof typeof svc.prices];
    if (p !== undefined) setForm((f) => ({ ...f, price: String(p) }));
  }, [form.service, form.vehicleType, services]);

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName || !form.service || !form.date || !form.timeSlot) {
      setError('Veuillez remplir le nom, le service, la date et l\'heure.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const svc = services.find((s) => s.id === form.service);
      const res = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName:  form.clientName,
          clientPhone: form.clientPhone  || '',
          clientEmail: form.clientEmail  || '',
          service:     svc?.name        ?? form.service,
          vehicleType: form.vehicleType,
          date:        form.date,
          timeSlot:    form.timeSlot,
          price:       parseFloat(form.price) || 0,
          source:      form.source,
          notes:       form.notes,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.detail ?? json.error ?? 'Erreur inconnue');
      setDone(true);
      startTransition(() => router.refresh());
      setTimeout(onClose, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  // Min = today (admin can book same-day)
  const today = new Date().toISOString().split('T')[0];

  const displayDate = form.date
    ? new Date(form.date + 'T12:00:00').toLocaleDateString('fr-CA', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      })
    : 'Choisir une date...';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={handleBackdrop}
    >
      <div className="w-full sm:max-w-lg bg-brand-black-soft border border-brand-black-border sm:rounded-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-black-border flex-shrink-0">
          <h2 className="text-base font-semibold text-brand-cream">Ajouter une réservation</h2>
          <button onClick={onClose} className="p-2 text-brand-cream-muted hover:text-brand-cream transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
            <div className="w-14 h-14 bg-brand-gold/10 border-2 border-brand-gold/30 rounded-full flex items-center justify-center">
              <Check className="w-7 h-7 text-brand-gold" />
            </div>
            <p className="text-brand-cream font-semibold">Réservation créée!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0">
            <div className="px-5 py-5 space-y-4">

              {/* Client name */}
              <div>
                <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                  Nom du client *
                </label>
                <input
                  className="input-dark w-full"
                  placeholder="Marie Tremblay"
                  value={form.clientName}
                  onChange={(e) => set('clientName', e.target.value)}
                  required
                />
              </div>

              {/* Phone + email — both optional */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    className="input-dark w-full"
                    placeholder="514-555-0100"
                    value={form.clientPhone}
                    onChange={(e) => set('clientPhone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                    Courriel
                  </label>
                  <input
                    type="email"
                    className="input-dark w-full"
                    placeholder="optionnel"
                    value={form.clientEmail}
                    onChange={(e) => set('clientEmail', e.target.value)}
                  />
                </div>
              </div>

              {/* Service */}
              <div>
                <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                  Service *
                </label>
                <select
                  className="input-dark w-full"
                  value={form.service}
                  onChange={(e) => set('service', e.target.value)}
                  required
                >
                  {services.length === 0 && <option value="">Chargement...</option>}
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Vehicle type */}
              <div>
                <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                  Type de véhicule *
                </label>
                <select
                  className="input-dark w-full"
                  value={form.vehicleType}
                  onChange={(e) => set('vehicleType', e.target.value)}
                >
                  {VEHICLE_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Date — custom display + transparent native input overlay */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                    Date *
                  </label>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => dateInputRef.current?.showPicker?.()}
                  >
                    <div className="input-dark flex items-center justify-between pointer-events-none select-none">
                      <span className={`text-sm truncate ${form.date ? 'text-brand-cream' : 'text-brand-cream-muted/50'}`}>
                        {displayDate}
                      </span>
                      <CalendarDays className="w-4 h-4 text-brand-gold flex-shrink-0 ml-2" />
                    </div>
                    <input
                      ref={dateInputRef}
                      type="date"
                      min={today}
                      value={form.date}
                      onChange={(e) => set('date', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                    Heure *
                  </label>
                  <select
                    className="input-dark w-full"
                    value={form.timeSlot}
                    onChange={(e) => set('timeSlot', e.target.value)}
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price + source */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                    Prix ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream-muted/50 text-sm pointer-events-none">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-dark w-full pl-6"
                      value={form.price}
                      onChange={(e) => set('price', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                    Source *
                  </label>
                  <select
                    className="input-dark w-full"
                    value={form.source}
                    onChange={(e) => set('source', e.target.value)}
                  >
                    {SOURCES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                  Notes
                </label>
                <textarea
                  className="input-dark w-full resize-none"
                  rows={2}
                  placeholder="Optionnel..."
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-brand-black-border flex-shrink-0 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-brand-black-border text-brand-cream-muted text-sm hover:text-brand-cream hover:border-brand-gold/30 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-gold py-3 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirmer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
