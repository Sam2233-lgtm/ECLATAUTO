'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X, Car } from 'lucide-react';

interface VehicleCategory {
  id: string;
  nameFr: string;
  nameEn: string;
  order: number;
  active: boolean;
}

const EMPTY: Omit<VehicleCategory, 'id'> = { nameFr: '', nameEn: '', order: 0, active: true };

export default function VehicleCategoriesManager({ initialCategories }: { initialCategories: VehicleCategory[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState<VehicleCategory[]>(initialCategories);
  const [editing, setEditing] = useState<VehicleCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<VehicleCategory, 'id'>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function openEdit(cat: VehicleCategory) {
    setEditing(cat);
    setForm({ nameFr: cat.nameFr, nameEn: cat.nameEn, order: cat.order, active: cat.active });
    setCreating(false);
    setError('');
  }

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setForm({ ...EMPTY, order: categories.length });
    setError('');
  }

  function cancelForm() {
    setEditing(null);
    setCreating(false);
    setError('');
  }

  async function handleSave() {
    if (!form.nameFr.trim() || !form.nameEn.trim()) {
      setError('Le nom en français et en anglais sont requis.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (creating) {
        const res = await fetch('/api/admin/vehicle-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const newCat = await res.json();
        setCategories((prev) => [...prev, newCat]);
      } else if (editing) {
        const res = await fetch(`/api/admin/vehicle-categories/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setCategories((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      }
      cancelForm();
      router.refresh();
    } catch {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(cat: VehicleCategory) {
    const res = await fetch(`/api/admin/vehicle-categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !cat.active }),
    });
    const updated = await res.json();
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
  }

  async function handleDelete(cat: VehicleCategory) {
    if (!confirm(`Supprimer "${cat.nameFr}" ? Les prix de cette catégorie seront retirés de tous les services.`)) return;
    await fetch(`/api/admin/vehicle-categories/${cat.id}`, { method: 'DELETE' });
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    router.refresh();
  }

  const isFormOpen = editing !== null || creating;

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl px-4 py-3">
        <p className="text-brand-cream-muted text-sm">
          Les catégories actives apparaissent dans le formulaire de réservation et dans la grille de prix de chaque service.
          Modifier ou supprimer une catégorie n'affecte pas les réservations existantes.
        </p>
      </div>

      {!isFormOpen && (
        <button onClick={openCreate} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </button>
      )}

      {isFormOpen && (
        <div className="card-dark p-6">
          <h2 className="text-xl font-semibold text-brand-cream mb-5">
            {creating ? 'Nouvelle catégorie' : `Modifier : ${editing?.nameFr}`}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Nom en français *</label>
              <input
                className="input-dark"
                value={form.nameFr}
                onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
                placeholder="ex: VUS / Crossover"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Nom en anglais *</label>
              <input
                className="input-dark"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder="ex: SUV / Crossover"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Ordre d'affichage</label>
              <input
                type="number"
                className="input-dark"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
            <div className="flex items-center gap-3 mt-5">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <div className="w-10 h-5 bg-brand-black-border rounded-full peer peer-checked:bg-brand-gold transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </label>
              <span className="text-sm text-brand-cream-muted">Catégorie active</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button onClick={handleSave} disabled={loading} className="btn-gold flex items-center gap-2 disabled:opacity-60">
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
                : <Check className="w-4 h-4" />}
              {creating ? 'Créer' : 'Enregistrer'}
            </button>
            <button onClick={cancelForm} className="btn-ghost flex items-center gap-2">
              <X className="w-4 h-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`card-dark p-4 flex items-center gap-4 transition-opacity ${!cat.active ? 'opacity-50' : ''}`}
          >
            <div className="w-9 h-9 bg-brand-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Car className="w-4 h-4 text-brand-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-brand-cream font-semibold">{cat.nameFr}</span>
                <span className="text-brand-cream-muted/40 text-xs">|</span>
                <span className="text-brand-cream-muted text-sm">{cat.nameEn}</span>
                {!cat.active && (
                  <span className="px-2 py-0.5 bg-brand-black-border text-brand-cream-muted text-xs rounded-full">Inactive</span>
                )}
              </div>
              <div className="text-brand-cream-muted/50 text-xs mt-0.5">Ordre : {cat.order}</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => toggleActive(cat)}
                title={cat.active ? 'Désactiver' : 'Activer'}
                className="p-2 rounded-lg text-brand-cream-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all"
              >
                {cat.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => openEdit(cat)}
                className="p-2 rounded-lg text-brand-cream-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat)}
                className="p-2 rounded-lg text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="card-dark p-10 text-center text-brand-cream-muted">
            Aucune catégorie. Créez la première en cliquant sur "Nouvelle catégorie".
          </div>
        )}
      </div>
    </div>
  );
}
