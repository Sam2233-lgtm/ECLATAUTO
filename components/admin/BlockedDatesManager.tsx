'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, CalendarX } from 'lucide-react';

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

interface BlockedDate {
  id: string;
  date: string;
  timeSlot?: string | null;
  reason?: string | null;
  createdAt: Date;
}

interface BlockedDatesManagerProps {
  initialBlocked: BlockedDate[];
}

export default function BlockedDatesManager({ initialBlocked }: BlockedDatesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [list, setList] = useState<BlockedDate[]>(initialBlocked);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  async function handleAdd() {
    if (!date) { setError('Veuillez sélectionner une date.'); return; }
    setAdding(true); setError('');
    try {
      const res = await fetch('/api/admin/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          timeSlot: timeSlot || null,
          reason: reason.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      const created: BlockedDate = await res.json();
      setList((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
      setDate('');
      setTimeSlot('');
      setReason('');
      showSuccess('Date bloquée ajoutée!');
      startTransition(() => router.refresh());
    } catch {
      setError('Erreur lors de l\'ajout.');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Débloquer cette date?')) return;
    setDeletingId(id); setError('');
    try {
      const res = await fetch(`/api/admin/blocked-dates/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setList((prev) => prev.filter((b) => b.id !== id));
      showSuccess('Date débloquée.');
      startTransition(() => router.refresh());
    } catch {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-CA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
          <p className="text-green-400 text-sm">{successMsg}</p>
        </div>
      )}

      {/* Add form */}
      <div className="card-dark p-6">
        <h2 className="text-lg font-semibold text-brand-cream mb-5 flex items-center gap-2">
          <CalendarX className="w-5 h-5 text-brand-gold" />
          Bloquer une date
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                className="input-dark"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                Créneau horaire
              </label>
              <select
                className="input-dark"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                <option value="">Toute la journée</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              <p className="text-brand-cream-muted/50 text-xs mt-1">
                Vide = journée entière bloquée
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
              Raison (facultatif)
            </label>
            <input
              type="text"
              className="input-dark"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Vacances, férié, maintenance..."
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={adding || !date}
            className="btn-gold flex items-center gap-2 disabled:opacity-60"
          >
            {adding ? (
              <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Bloquer cette date
          </button>
        </div>
      </div>

      {/* Blocked dates list */}
      <div>
        <h2 className="text-lg font-semibold text-brand-cream mb-4">
          Dates bloquées
          <span className="ml-2 text-sm font-normal text-brand-cream-muted">({list.length})</span>
        </h2>

        {list.length === 0 ? (
          <div className="card-dark p-8 text-center text-brand-cream-muted">
            Aucune date bloquée pour le moment.
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((b) => (
              <div
                key={b.id}
                className="card-dark px-5 py-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-brand-cream text-sm font-medium capitalize">
                      {formatDate(b.date)}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      b.timeSlot
                        ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {b.timeSlot ? b.timeSlot : 'Journée entière'}
                    </span>
                  </div>
                  {b.reason && (
                    <p className="text-brand-cream-muted/60 text-xs mt-1">{b.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={deletingId === b.id}
                  className="p-2 rounded-lg text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 flex-shrink-0"
                  title="Débloquer"
                >
                  {deletingId === b.id ? (
                    <span className="inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
