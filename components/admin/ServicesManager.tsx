'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X, GripVertical } from 'lucide-react';

type VehicleType = 'compact' | 'sedan' | 'suv' | 'truck' | 'van';

const VEHICLE_LABELS: Record<VehicleType, string> = {
  compact: 'Compacte',
  sedan:   'Berline',
  suv:     'VUS / Crossover',
  truck:   'Camion',
  van:     'Fourgonnette / Minivan',
};

const VEHICLE_TYPES: VehicleType[] = ['compact', 'sedan', 'suv', 'truck', 'van'];

interface Service {
  id: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  includesFr: string;
  includesEn: string;
  basePrice: number;
  pricing: Record<VehicleType, number> | null;
  duration: number;
  active: boolean;
  order: number;
  iconName: string;
}

const EMPTY_PRICING: Record<VehicleType, number> = {
  compact: 0, sedan: 0, suv: 0, truck: 0, van: 0,
};

const EMPTY_SERVICE: Omit<Service, 'id'> = {
  nameFr: '', nameEn: '', descriptionFr: '', descriptionEn: '',
  includesFr: '', includesEn: '', basePrice: 0, pricing: { ...EMPTY_PRICING },
  duration: 60, active: true, order: 0, iconName: 'Sparkles',
};

const ICON_OPTIONS = ['Droplets', 'Sparkles', 'Wind', 'Shield', 'Star', 'Car', 'Zap', 'Award'];

export default function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Service, 'id'>>(EMPTY_SERVICE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function openEdit(service: Service) {
    setEditing(service);
    setForm({
      ...service,
      pricing: service.pricing ?? { ...EMPTY_PRICING },
    });
    setCreating(false);
    setError('');
  }

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setForm({ ...EMPTY_SERVICE, order: services.length });
    setError('');
  }

  function cancelForm() {
    setEditing(null);
    setCreating(false);
    setError('');
  }

  function updatePricing(type: VehicleType, value: number) {
    setForm((prev) => ({
      ...prev,
      pricing: { ...(prev.pricing ?? EMPTY_PRICING), [type]: value },
    }));
  }

  async function handleSave() {
    if (!form.nameFr || !form.nameEn || !form.duration) {
      setError('Les champs nom (FR/EN) et durée sont requis.');
      return;
    }
    const pricing = form.pricing ?? EMPTY_PRICING;
    const hasAnyPrice = Object.values(pricing).some((v) => v > 0);
    if (!hasAnyPrice) {
      setError('Veuillez entrer au moins un prix pour un type de véhicule.');
      return;
    }
    // basePrice = minimum non-zero price for backward compatibility
    const minPrice = Math.min(...Object.values(pricing).filter((v) => v > 0));
    const payload = { ...form, basePrice: minPrice, pricing };
    setLoading(true);
    setError('');
    try {
      if (creating) {
        const res = await fetch('/api/admin/services', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        const newService = await res.json();
        setServices((prev) => [...prev, newService]);
      } else if (editing) {
        const res = await fetch(`/api/admin/services/${editing.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        const updated = await res.json();
        setServices((prev) => prev.map((s) => (s.id === editing.id ? updated : s)));
      }
      cancelForm();
      router.refresh();
    } catch {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(service: Service) {
    const res = await fetch(`/api/admin/services/${service.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !service.active }),
    });
    const updated = await res.json();
    setServices((prev) => prev.map((s) => (s.id === service.id ? updated : s)));
  }

  async function handleDelete(service: Service) {
    if (!confirm(`Supprimer "${service.nameFr}"? Cette action est irréversible.`)) return;
    await fetch(`/api/admin/services/${service.id}`, { method: 'DELETE' });
    setServices((prev) => prev.filter((s) => s.id !== service.id));
    router.refresh();
  }

  const isFormOpen = editing !== null || creating;

  return (
    <div className="space-y-6">
      {/* Header action */}
      {!isFormOpen && (
        <button onClick={openCreate} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau service
        </button>
      )}

      {/* Form */}
      {isFormOpen && (
        <div className="card-dark p-6">
          <h2 className="text-xl font-semibold text-brand-cream mb-5">
            {creating ? 'Nouveau service' : `Modifier : ${editing?.nameFr}`}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Nom (FR) *</label>
              <input className="input-dark" value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} placeholder="Lavage extérieur de base" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Nom (EN) *</label>
              <input className="input-dark" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Basic Exterior Wash" />
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
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Ce qui est inclus (FR) — une ligne par item</label>
              <textarea className="input-dark resize-none font-mono text-sm" rows={5} value={form.includesFr} onChange={(e) => setForm({ ...form, includesFr: e.target.value })} placeholder="Rinçage haute pression&#10;Savonnage et dégraissage&#10;..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">What's included (EN) — one item per line</label>
              <textarea className="input-dark resize-none font-mono text-sm" rows={5} value={form.includesEn} onChange={(e) => setForm({ ...form, includesEn: e.target.value })} placeholder="High-pressure rinse&#10;Soap wash & degreasing&#10;..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-brand-cream-muted mb-3">
                Prix par type de véhicule ($) *
                <span className="ml-2 text-brand-cream-muted/60 font-normal">— entrez 0 pour masquer un type</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {VEHICLE_TYPES.map((type) => (
                  <div key={type}>
                    <label className="block text-xs text-brand-cream-muted/70 mb-1">{VEHICLE_LABELS[type]}</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-gold text-sm font-bold">$</span>
                      <input
                        type="number"
                        className="input-dark pl-6"
                        value={(form.pricing ?? EMPTY_PRICING)[type] || ''}
                        onChange={(e) => updatePricing(type, parseInt(e.target.value) || 0)}
                        min={0}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Durée (minutes) *</label>
              <input type="number" className="input-dark" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })} min={15} step={15} />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Icône</label>
              <select className="input-dark" value={form.iconName} onChange={(e) => setForm({ ...form, iconName: e.target.value })}>
                {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </select>
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
              <span className="text-sm text-brand-cream-muted">Service actif</span>
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

      {/* Services list */}
      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.id} className={`card-dark p-5 flex items-center gap-4 transition-opacity ${!service.active ? 'opacity-50' : ''}`}>
            <GripVertical className="w-5 h-5 text-brand-cream-muted/30 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-brand-cream font-semibold">{service.nameFr}</span>
                <span className="text-brand-cream-muted/50 text-xs">/</span>
                <span className="text-brand-cream-muted text-sm">{service.nameEn}</span>
                {!service.active && (
                  <span className="px-2 py-0.5 bg-brand-black-border text-brand-cream-muted text-xs rounded-full">Inactif</span>
                )}
              </div>
              <div className="text-brand-cream-muted text-sm mt-0.5 truncate">{service.descriptionFr}</div>
            </div>
            <div className="text-right flex-shrink-0 hidden sm:block">
              {service.pricing ? (
                <div className="text-xs text-brand-cream-muted space-y-0.5">
                  {VEHICLE_TYPES.filter((t) => (service.pricing as Record<string, number>)[t] > 0).map((t) => (
                    <div key={t} className="flex justify-between gap-3">
                      <span>{VEHICLE_LABELS[t]}</span>
                      <span className="text-brand-gold font-semibold">${(service.pricing as Record<string, number>)[t]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-brand-gold font-bold text-lg">${service.basePrice}</div>
              )}
              <div className="text-brand-cream-muted text-xs mt-1">{service.duration} min</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => toggleActive(service)} title={service.active ? 'Désactiver' : 'Activer'}
                className="p-2 rounded-lg text-brand-cream-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all">
                {service.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => openEdit(service)}
                className="p-2 rounded-lg text-brand-cream-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(service)}
                className="p-2 rounded-lg text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="card-dark p-10 text-center text-brand-cream-muted">
            Aucun service. Créez le premier en cliquant sur "Nouveau service".
          </div>
        )}
      </div>
    </div>
  );
}
