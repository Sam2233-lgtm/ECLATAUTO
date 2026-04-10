'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X, GripVertical } from 'lucide-react';

interface Supplement {
  id: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  price: number;
  active: boolean;
  order: number;
}

const EMPTY: Omit<Supplement, 'id'> = {
  nameFr: '', nameEn: '', descriptionFr: '', descriptionEn: '', price: 0, active: true, order: 0,
};

export default function SupplementsManager({ initialSupplements }: { initialSupplements: Supplement[] }) {
  const router = useRouter();
  const [supplements, setSupplements] = useState<Supplement[]>(initialSupplements);
  const [editing, setEditing] = useState<Supplement | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Supplement, 'id'>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function openEdit(s: Supplement) {
    setEditing(s);
    setForm({ nameFr: s.nameFr, nameEn: s.nameEn, descriptionFr: s.descriptionFr, descriptionEn: s.descriptionEn, price: s.price, active: s.active, order: s.order });
    setCreating(false);
    setError('');
  }

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setForm({ ...EMPTY, order: supplements.length });
    setError('');
  }

  function cancelForm() {
    setEditing(null);
    setCreating(false);
    setError('');
  }

  async function handleSave() {
    if (!form.nameFr || !form.nameEn) {
      setError('Les noms FR et EN sont requis.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (creating) {
        const res = await fetch('/api/admin/supplements', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
        const created = await res.json();
        setSupplements((prev) => [...prev, created]);
      } else if (editing) {
        const res = await fetch(`/api/admin/supplements/${editing.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
        const updated = await res.json();
        setSupplements((prev) => prev.map((s) => (s.id === editing.id ? updated : s)));
      }
      cancelForm();
      router.refresh();
    } catch {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(s: Supplement) {
    const res = await fetch(`/api/admin/supplements/${s.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    });
    const updated = await res.json();
    setSupplements((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
  }

  async function handleDelete(s: Supplement) {
    if (!confirm(`Supprimer "${s.nameFr}"? Cette action est irréversible.`)) return;
    await fetch(`/api/admin/supplements/${s.id}`, { method: 'DELETE' });
    setSupplements((prev) => prev.filter((x) => x.id !== s.id));
    router.refresh();
  }

  const isFormOpen = editing !== null || creating;

  return (
    <div className="space-y-6">
      {!isFormOpen && (
        <button onClick={openCreate} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau supplément
        </button>
      )}

      {isFormOpen && (
        <div className="card-dark p-6">
          <h2 className="text-xl font-semibold text-brand-cream mb-5">
            {creating ? 'Nouveau supplément' : `Modifier : ${editing?.nameFr}`}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Nom (FR) *</label>
              <input className="input-dark" value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} placeholder="Traitement anti-sel" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Nom (EN) *</label>
              <input className="input-dark" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Anti-salt treatment" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Description (FR)</label>
              <textarea className="input-dark resize-none" rows={2} value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Description (EN)</label>
              <textarea className="input-dark resize-none" rows={2} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Prix ($)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-gold text-sm font-bold">$</span>
                <input
                  type="number"
                  className="input-dark pl-6"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Ordre d'affichage</label>
              <input type="number" className="input-dark" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} min={0} />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <div className="w-10 h-5 bg-brand-black-border rounded-full peer peer-checked:bg-brand-gold transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </label>
              <span className="text-sm text-brand-cream-muted">Supplément actif</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button onClick={handleSave} disabled={loading} className="btn-gold flex items-center gap-2 disabled:opacity-60">
              {loading ? <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              {creating ? 'Créer' : 'Enregistrer'}
            </button>
            <button onClick={cancelForm} className="btn-ghost flex items-center gap-2">
              <X className="w-4 h-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {supplements.map((s) => (
          <div key={s.id} className={`card-dark p-5 flex items-center gap-4 transition-opacity ${!s.active ? 'opacity-50' : ''}`}>
            <GripVertical className="w-5 h-5 text-brand-cream-muted/30 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-brand-cream font-semibold">{s.nameFr}</span>
                <span className="text-brand-cream-muted/50 text-xs">/</span>
                <span className="text-brand-cream-muted text-sm">{s.nameEn}</span>
                {!s.active && (
                  <span className="px-2 py-0.5 bg-brand-black-border text-brand-cream-muted text-xs rounded-full">Inactif</span>
                )}
              </div>
              {s.descriptionFr && (
                <div className="text-brand-cream-muted text-sm mt-0.5 truncate">{s.descriptionFr}</div>
              )}
            </div>
            <div className="text-right flex-shrink-0 hidden sm:block">
              <div className="text-brand-gold font-bold text-lg">${s.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => toggleActive(s)} title={s.active ? 'Désactiver' : 'Activer'}
                className="p-2 rounded-lg text-brand-cream-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all">
                {s.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => openEdit(s)}
                className="p-2 rounded-lg text-brand-cream-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(s)}
                className="p-2 rounded-lg text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {supplements.length === 0 && (
          <div className="card-dark p-10 text-center text-brand-cream-muted">
            Aucun supplément. Créez le premier en cliquant sur "Nouveau supplément".
          </div>
        )}
      </div>
    </div>
  );
}
