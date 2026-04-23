'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Check, Plus, Trash2, Loader2 } from 'lucide-react';

interface MaintenancePlan {
  id: string;
  name: string;
  frequency: string;
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
  order: number;
}

interface MaintenancePlansManagerProps {
  plans: MaintenancePlan[];
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors focus:outline-none ${
        value ? 'bg-brand-gold' : 'bg-brand-black-border'
      }`}
    >
      <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function MaintenancePlansManager({ plans: initialPlans }: MaintenancePlansManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [plans, setPlans] = useState(initialPlans);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  function updatePlan(id: string, patch: Partial<MaintenancePlan>) {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function addFeature(id: string) {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, features: [...p.features, ''] } : p))
    );
  }

  function updateFeature(id: string, idx: number, val: string) {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const features = [...p.features];
        features[idx] = val;
        return { ...p, features };
      })
    );
  }

  function removeFeature(id: string, idx: number) {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, features: p.features.filter((_, i) => i !== idx) } : p
      )
    );
  }

  async function savePlan(plan: MaintenancePlan) {
    setSaving(plan.id);
    try {
      const res = await fetch(`/api/admin/maintenance-plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: plan.name,
          frequency: plan.frequency,
          price: plan.price,
          description: plan.description,
          features: plan.features.filter((f) => f.trim() !== ''),
          isActive: plan.isActive,
          order: plan.order,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(plan.id);
      setTimeout(() => setSaved(null), 3000);
      startTransition(() => router.refresh());
    } catch {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-8">
      {plans.map((plan) => (
        <div key={plan.id} className="card-dark p-6 border border-brand-black-border rounded-xl space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-lg font-semibold text-brand-cream">{plan.name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-brand-cream-muted text-xs">{plan.isActive ? 'Actif' : 'Inactif'}</span>
              <Toggle value={plan.isActive} onChange={(v) => updatePlan(plan.id, { isActive: v })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">Nom</label>
              <input
                className="input-dark w-full"
                value={plan.name}
                onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">Fréquence</label>
              <input
                className="input-dark w-full"
                placeholder="1x/mois, 2x/mois..."
                value={plan.frequency}
                onChange={(e) => updatePlan(plan.id, { frequency: e.target.value })}
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">Prix / mois ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream-muted/50 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-dark w-full pl-6"
                  value={plan.price}
                  onChange={(e) => updatePlan(plan.id, { price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Order */}
            <div>
              <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">Ordre d'affichage</label>
              <input
                type="number"
                min="0"
                className="input-dark w-full"
                value={plan.order}
                onChange={(e) => updatePlan(plan.id, { order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">Description</label>
            <textarea
              className="input-dark w-full resize-none"
              rows={2}
              value={plan.description}
              onChange={(e) => updatePlan(plan.id, { description: e.target.value })}
            />
          </div>

          {/* Features */}
          <div>
            <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-2 block font-sans">
              Inclusions
            </label>
            <div className="space-y-2">
              {plan.features.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-brand-gold text-xs select-none">✓</span>
                  <input
                    className="input-dark flex-1"
                    value={f}
                    placeholder={`Inclusion ${idx + 1}...`}
                    onChange={(e) => updateFeature(plan.id, idx, e.target.value)}
                  />
                  <button
                    onClick={() => removeFeature(plan.id, idx)}
                    className="p-2 text-brand-cream-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addFeature(plan.id)}
                className="flex items-center gap-2 text-xs text-brand-cream-muted hover:text-brand-cream transition-colors mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une inclusion
              </button>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2 border-t border-brand-black-border">
            <button
              onClick={() => savePlan(plan)}
              disabled={saving === plan.id}
              className="btn-gold flex items-center gap-2 text-sm py-2.5 px-6 disabled:opacity-60"
            >
              {saving === plan.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved === plan.id ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved === plan.id ? 'Sauvegardé!' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
