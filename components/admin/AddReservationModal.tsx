'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Loader2 } from 'lucide-react';

interface ServiceCard {
  id: string;
  name: string;
  prices: { berline: number; vus: number; pickup: number; fourgonnette: number };
}

interface AddReservationModalProps {
  onClose: () => void;
}

const VEHICLE_TYPES = [
  { value: 'berline',      labelFr: 'Berline' },
  { value: 'vus',          labelFr: 'VUS' },
  { value: 'pickup',       labelFr: 'Pick-up' },
  { value: 'fourgonnette', labelFr: 'Fourgonnette' },
] as const;

const SOURCES = ['TÉLÉPHONE', 'TEXTO'] as const;

const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

type VehicleType = typeof VEHICLE_TYPES[number]['value'];

export default function AddReservationModal({ onClose }: AddReservationModalProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [services, setServices] = useState<ServiceCard[]>([]);
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    service: '',
    vehicleType: 'berline' as VehicleType,
    date: '',
    timeSlot: '09:00',
    price: '',
    source: 'TÉLÉPHONE' as typeof SOURCES[number],
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Load service cards
  useEffect(() => {
    fetch('/api/public/service-cards')
      .then((r) => r.json())
      .then((data: ServiceCard[]) => {
        setServices(data);
        if (data.length > 0) setForm((f) => ({ ...f, service: data[0].id }));
      })
      .catch(() => {});
  }, []);

  // Auto-compute price when service or vehicleType changes
  useEffect(() => {
    const svc = services.find((s) => s.id === form.service);
    if (svc) {
      const p = svc.prices[form.vehicleType as keyof typeof svc.prices];
      if (p !== undefined) setForm((f) => ({ ...f, price: String(p) }));
    }
  }, [form.service, form.vehicleType, services]);

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName || !form.clientPhone || !form.service || !form.date || !form.timeSlot) {
      setError('Veuillez remplir tous les champs obligatoires.');
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
          clientName: form.clientName,
          clientPhone: form.clientPhone,
          clientEmail: form.clientEmail || undefined,
          service: svc?.name ?? form.service,
          vehicleType: form.vehicleType,
          date: form.date,
          timeSlot: form.timeSlot,
          price: parseFloat(form.price) || 0,
          source: form.source,
          notes: form.notes,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Erreur');
      setDone(true);
      startTransition(() => router.refresh());
      setTimeout(onClose, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setSubmitting(false);
    }
  }

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={handleBackdrop}
    >
      <div className="w-full sm:max-w-lg bg-brand-black-soft border border-brand-black-border sm:rounded-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-black-border flex-shrink-0">
          <h2 className="text-base font-semibold text-brand-cream">
            Ajouter une réservation
          </h2>
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
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
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

              {/* Phone + email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    className="input-dark w-full"
                    placeholder="514-555-0100"
                    value={form.clientPhone}
                    onChange={(e) => set('clientPhone', e.target.value)}
                    required
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
                  {VEHICLE_TYPES.map(({ value, labelFr }) => (
                    <option key={value} value={value}>{labelFr}</option>
                  ))}
                </select>
              </div>

              {/* Date + time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">
                    Date *
                  </label>
                  <input
                    type="date"
                    className="input-dark w-full"
                    min={tomorrow}
                    value={form.date}
                    onChange={(e) => set('date', e.target.value)}
                    required
                  />
                </div>
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream-muted/50 text-sm">$</span>
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
                    onChange={(e) => set('source', e.target.value as typeof form.source)}
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
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

              {error && <p className="text-red-400 text-sm">{error}</p>}
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
