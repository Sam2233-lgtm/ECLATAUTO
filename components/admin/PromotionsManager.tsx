'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Check, X, Tag, Calendar, Percent } from 'lucide-react';

interface Service { id: string; nameFr: string; nameEn: string; }
interface PromotionService { serviceId: string; service: Service; }
interface Promotion {
  id: string; name: string; description: string | null;
  discountType: string; discountValue: number;
  startDate: string | Date; endDate: string | Date;
  active: boolean; services: PromotionService[];
}

const EMPTY_FORM = {
  name: '', description: '', discountType: 'percentage', discountValue: 10,
  startDate: '', endDate: '', active: true, serviceIds: [] as string[],
};

function getStatus(promo: Promotion): 'active' | 'upcoming' | 'expired' | 'disabled' {
  if (!promo.active) return 'disabled';
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);
  if (start > now) return 'upcoming';
  if (end < now) return 'expired';
  return 'active';
}

const STATUS_STYLES = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  expired: 'bg-brand-black-border text-brand-cream-muted border-brand-black-border',
  disabled: 'bg-red-500/10 text-red-400 border-red-500/20',
};
const STATUS_LABELS = { active: 'Active', upcoming: 'À venir', expired: 'Expirée', disabled: 'Désactivée' };

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('fr-CA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function toInputDate(date: string | Date) {
  return new Date(date).toISOString().split('T')[0];
}

export default function PromotionsManager({
  initialPromotions, availableServices,
}: { initialPromotions: Promotion[]; availableServices: Service[] }) {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function openCreate() {
    setCreating(true); setEditing(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    setForm({ ...EMPTY_FORM, startDate: today, endDate: nextMonth });
    setError('');
  }

  function openEdit(promo: Promotion) {
    setEditing(promo); setCreating(false);
    setForm({
      name: promo.name, description: promo.description || '',
      discountType: promo.discountType, discountValue: promo.discountValue,
      startDate: toInputDate(promo.startDate), endDate: toInputDate(promo.endDate),
      active: promo.active, serviceIds: promo.services.map((s) => s.serviceId),
    });
    setError('');
  }

  function cancelForm() { setEditing(null); setCreating(false); setError(''); }

  function toggleServiceId(id: string) {
    setForm((f) => ({
      ...f, serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter((s) => s !== id) : [...f.serviceIds, id],
    }));
  }

  async function handleSave() {
    if (!form.name || !form.startDate || !form.endDate || form.discountValue <= 0) {
      setError('Nom, dates et valeur de réduction sont requis.'); return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('La date de fin doit être après la date de début.'); return;
    }
    setLoading(true); setError('');
    try {
      if (creating) {
        const res = await fetch('/api/admin/promotions', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
        const newPromo = await res.json();
        setPromotions((prev) => [newPromo, ...prev]);
      } else if (editing) {
        const res = await fetch(`/api/admin/promotions/${editing.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
        const updated = await res.json();
        setPromotions((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
      }
      cancelForm(); router.refresh();
    } catch { setError('Erreur lors de la sauvegarde.'); }
    finally { setLoading(false); }
  }

  async function handleDelete(promo: Promotion) {
    if (!confirm(`Supprimer la promotion "${promo.name}"?`)) return;
    await fetch(`/api/admin/promotions/${promo.id}`, { method: 'DELETE' });
    setPromotions((prev) => prev.filter((p) => p.id !== promo.id));
    router.refresh();
  }

  const isFormOpen = creating || editing !== null;

  return (
    <div className="space-y-6">
      {!isFormOpen && (
        <button onClick={openCreate} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle promotion
        </button>
      )}

      {/* Form */}
      {isFormOpen && (
        <div className="card-dark p-6">
          <h2 className="text-xl font-semibold text-brand-cream mb-5">
            {creating ? 'Nouvelle promotion' : `Modifier : ${editing?.name}`}
          </h2>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Nom de la promotion *</label>
              <input className="input-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Solde de printemps" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Description (optionnel)</label>
              <input className="input-dark" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Profitez de 20% sur nos services..." />
            </div>

            {/* Discount type */}
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Type de réduction *</label>
              <div className="flex gap-2">
                {[{ value: 'percentage', label: '% Pourcentage' }, { value: 'fixed', label: '$ Montant fixe' }].map(({ value, label }) => (
                  <button key={value} onClick={() => setForm({ ...form, discountType: value })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${form.discountType === value ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' : 'border-brand-black-border text-brand-cream-muted hover:border-brand-gold/40'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                Valeur * {form.discountType === 'percentage' ? '(%)' : '($)'}
              </label>
              <input type="number" className="input-dark" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: parseInt(e.target.value) || 0 })} min={1} max={form.discountType === 'percentage' ? 100 : undefined} />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Date de début *</label>
              <input type="date" className="input-dark" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Date de fin *</label>
              <input type="date" className="input-dark" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={{ colorScheme: 'dark' }} />
            </div>

            {/* Services */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-brand-cream-muted mb-2">Services concernés</label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map((s) => {
                  const selected = form.serviceIds.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => toggleServiceId(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selected ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' : 'border-brand-black-border text-brand-cream-muted hover:border-brand-gold/40'}`}>
                      {selected && <Check className="w-3 h-3 inline mr-1.5" />}{s.nameFr}
                    </button>
                  );
                })}
              </div>
              {form.serviceIds.length === 0 && <p className="text-brand-cream-muted/60 text-xs mt-1">Aucun service sélectionné = s'applique à tous</p>}
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <div className="w-10 h-5 bg-brand-black-border rounded-full peer peer-checked:bg-brand-gold transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </label>
              <span className="text-sm text-brand-cream-muted">Promotion active</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button onClick={handleSave} disabled={loading} className="btn-gold flex items-center gap-2 disabled:opacity-60">
              {loading ? <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              {creating ? 'Créer' : 'Enregistrer'}
            </button>
            <button onClick={cancelForm} className="btn-ghost flex items-center gap-2"><X className="w-4 h-4" /> Annuler</button>
          </div>
        </div>
      )}

      {/* Promotions list */}
      <div className="space-y-3">
        {promotions.map((promo) => {
          const status = getStatus(promo);
          return (
            <div key={promo.id} className="card-dark p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="text-brand-cream font-semibold">{promo.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${STATUS_STYLES[status]}`}>
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-brand-cream-muted">
                    <span className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-brand-gold" />
                      {promo.discountType === 'percentage' ? `-${promo.discountValue}%` : `-${promo.discountValue}$`}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                      {formatDate(promo.startDate)} → {formatDate(promo.endDate)}
                    </span>
                    {promo.services.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-brand-gold" />
                        {promo.services.map((s) => s.service.nameFr).join(', ')}
                      </span>
                    )}
                  </div>
                  {promo.description && <p className="text-brand-cream-muted/70 text-xs mt-1.5">{promo.description}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(promo)} className="p-2 rounded-lg text-brand-cream-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(promo)} className="p-2 rounded-lg text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {promotions.length === 0 && (
          <div className="card-dark p-10 text-center text-brand-cream-muted">
            Aucune promotion. Créez-en une pour fidéliser vos clients!
          </div>
        )}
      </div>
    </div>
  );
}
