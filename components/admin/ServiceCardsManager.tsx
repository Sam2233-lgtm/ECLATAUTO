'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, Check, UploadCloud, Loader2, ImageOff } from 'lucide-react';
import { uploadImageDirect } from '@/lib/upload-client';

type Prices = { berline: number; vus: number; pickup: number; fourgonnette: number };

interface ServiceCard {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  prices: Prices;
  isActive: boolean;
  order: number;
}

interface ServiceCardsManagerProps {
  cards: ServiceCard[];
}

const PRICE_LABELS = [
  { key: 'berline',      label: 'Berline' },
  { key: 'vus',         label: 'VUS' },
  { key: 'pickup',      label: 'Pick-up' },
  { key: 'fourgonnette', label: 'Fourgonnette' },
] as const;

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

export default function ServiceCardsManager({ cards: initialCards }: ServiceCardsManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [cards, setCards] = useState(initialCards);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function updateCard(id: string, patch: Partial<ServiceCard>) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function updatePrice(id: string, key: keyof Prices, val: string) {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, prices: { ...c.prices, [key]: parseFloat(val) || 0 } } : c
      )
    );
  }

  async function handleUpload(id: string, file: File) {
    setUploadingId(id);
    setUploadErrors((prev) => ({ ...prev, [id]: '' }));
    try {
      // Upload directly browser → Supabase (bypasses Netlify 6 MB limit)
      const publicUrl = await uploadImageDirect(file, 'services');

      // Update local state
      updateCard(id, { imageUrl: publicUrl });

      // Auto-save imageUrl to DB
      const card = cards.find((c) => c.id === id);
      if (card) {
        await fetch(`/api/admin/service-cards/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...card, imageUrl: publicUrl }),
        });
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setUploadErrors((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : 'Erreur upload',
      }));
    } finally {
      setUploadingId(null);
    }
  }

  async function saveCard(card: ServiceCard) {
    setSaving(card.id);
    try {
      const res = await fetch(`/api/admin/service-cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: card.name,
          description: card.description,
          imageUrl: card.imageUrl,
          prices: card.prices,
          isActive: card.isActive,
          order: card.order,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(card.id);
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
      {cards.map((card) => (
        <div key={card.id} className="card-dark p-6 border border-brand-black-border rounded-xl space-y-6">

          {/* Header row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-lg font-semibold text-brand-cream">{card.name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-brand-cream-muted text-xs">
                {card.isActive ? 'Actif' : 'Inactif'}
              </span>
              <Toggle value={card.isActive} onChange={(v) => updateCard(card.id, { isActive: v })} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
            {/* Left: fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">Nom</label>
                <input
                  className="input-dark w-full"
                  value={card.name}
                  onChange={(e) => updateCard(card.id, { name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-1.5 block font-sans">Description</label>
                <textarea
                  className="input-dark w-full resize-none"
                  rows={3}
                  value={card.description}
                  onChange={(e) => updateCard(card.id, { description: e.target.value })}
                />
              </div>

              {/* Prices */}
              <div>
                <label className="text-xs text-brand-cream-muted uppercase tracking-wider mb-2 block font-sans">Prix par type de véhicule</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRICE_LABELS.map(({ key, label }) => (
                    <div key={key}>
                      <div className="text-brand-cream-muted/60 text-[10px] uppercase tracking-wider mb-1 font-sans">{label}</div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream-muted/50 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input-dark w-full pl-6"
                          value={card.prices[key] ?? ''}
                          onChange={(e) => updatePrice(card.id, key, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: image upload */}
            <div className="flex flex-col gap-3 w-full lg:w-48">
              <label className="text-xs text-brand-cream-muted uppercase tracking-wider font-sans">Photo</label>

              {/* Preview */}
              <div className="relative w-full lg:w-48 aspect-[4/3] bg-brand-black-card border border-brand-black-border flex items-center justify-center overflow-hidden">
                {card.imageUrl ? (
                  <Image src={card.imageUrl} alt={card.name} fill className="object-cover" sizes="200px" />
                ) : (
                  <ImageOff className="w-8 h-8 text-brand-black-border" />
                )}
                {uploadingId === card.id && (
                  <div className="absolute inset-0 bg-brand-black/70 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload button */}
              {uploadErrors[card.id] && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-2 py-1.5 leading-tight">
                  {uploadErrors[card.id]}
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={(el) => { fileRefs.current[card.id] = el; }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(card.id, file);
                  e.target.value = '';
                }}
              />
              <button
                onClick={() => fileRefs.current[card.id]?.click()}
                disabled={uploadingId === card.id}
                className="flex items-center gap-2 text-xs text-brand-cream-muted hover:text-brand-cream border border-brand-black-border hover:border-brand-gold/30 px-3 py-2 transition-colors disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                {uploadingId === card.id ? 'Upload...' : 'Choisir une image'}
              </button>
              {card.imageUrl && (
                <button
                  onClick={() => updateCard(card.id, { imageUrl: null })}
                  className="text-xs text-red-400/60 hover:text-red-400 transition-colors text-left"
                >
                  Supprimer l'image
                </button>
              )}
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2 border-t border-brand-black-border">
            <button
              onClick={() => saveCard(card)}
              disabled={saving === card.id}
              className="btn-gold flex items-center gap-2 text-sm py-2.5 px-6 disabled:opacity-60"
            >
              {saving === card.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved === card.id ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved === card.id ? 'Sauvegardé!' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
