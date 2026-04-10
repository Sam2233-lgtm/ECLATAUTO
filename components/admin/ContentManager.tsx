'use client';

import { useState } from 'react';
import { Save, Check, Plus, Trash2, Edit2, X } from 'lucide-react';

interface SiteSettings {
  id: string;
  heroBadge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  statClients: string;
  statYears: string;
  statRating: string;
  phone: string;
  email: string;
  adminEmail: string;
  instagramUrl: string;
  facebookUrl: string;
  businessHours: string;
  serviceZone: string;
  bookingEnabled: boolean;
  confirmationMessage: string;
  updatedAt: Date;
}

interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  stars: number;
  active: boolean;
  order: number;
}

interface FAQ {
  id: string;
  questionFr: string;
  questionEn: string;
  answerFr: string;
  answerEn: string;
  active: boolean;
  order: number;
}

interface ContentManagerProps {
  settings: SiteSettings;
  testimonials: Testimonial[];
  faqs: FAQ[];
}

const TABS = ['hero', 'testimonials', 'faqs'] as const;
type Tab = typeof TABS[number];

const TAB_LABELS: Record<Tab, string> = {
  hero: 'Héro',
  testimonials: 'Témoignages',
  faqs: 'FAQ',
};

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-xl transition-colors ${n <= value ? 'text-brand-gold' : 'text-brand-black-border'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors focus:outline-none
        ${value ? 'bg-brand-gold' : 'bg-brand-black-border'}`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform
          ${value ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

/* ─── HERO TAB ─── */
function HeroTab({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState({
    heroBadge: settings.heroBadge,
    heroTitle: settings.heroTitle,
    heroTitleHighlight: settings.heroTitleHighlight,
    heroSubtitle: settings.heroSubtitle,
    statClients: settings.statClients,
    statYears: settings.statYears,
    statRating: settings.statRating,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setLoading(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="card-dark p-6 space-y-4">
        <h3 className="text-base font-semibold text-brand-cream">Section héro</h3>

        <div>
          <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Badge / sous-titre héro</label>
          <input
            className="input-dark"
            value={form.heroBadge}
            onChange={(e) => setForm({ ...form, heroBadge: e.target.value })}
            placeholder="Service à domicile au Québec"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Titre héro (ligne 1)</label>
          <input
            className="input-dark"
            value={form.heroTitle}
            onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
            placeholder="L'excellence automobile"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
            Titre héro (ligne 2 — en surbrillance dorée)
          </label>
          <input
            className="input-dark"
            value={form.heroTitleHighlight}
            onChange={(e) => setForm({ ...form, heroTitleHighlight: e.target.value })}
            placeholder="à votre porte"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Sous-titre / description héro</label>
          <textarea
            className="input-dark resize-none"
            rows={3}
            value={form.heroSubtitle}
            onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
            placeholder="Détailing professionnel de luxe..."
          />
        </div>
      </div>

      <div className="card-dark p-6">
        <h3 className="text-base font-semibold text-brand-cream mb-4">Statistiques</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Clients</label>
            <input
              className="input-dark"
              value={form.statClients}
              onChange={(e) => setForm({ ...form, statClients: e.target.value })}
              placeholder="500+"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Années</label>
            <input
              className="input-dark"
              value={form.statYears}
              onChange={(e) => setForm({ ...form, statYears: e.target.value })}
              placeholder="5+"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Note</label>
            <input
              className="input-dark"
              value={form.statRating}
              onChange={(e) => setForm({ ...form, statRating: e.target.value })}
              placeholder="4.9/5"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="btn-gold flex items-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
        ) : saved ? (
          <Check className="w-4 h-4" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saved ? 'Sauvegardé!' : 'Enregistrer'}
      </button>
    </div>
  );
}

/* ─── TESTIMONIALS TAB ─── */
const EMPTY_TESTIMONIAL = { name: '', location: '', text: '', stars: 5, active: true };

function TestimonialsTab({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [list, setList] = useState<Testimonial[]>(initialTestimonials);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Testimonial, 'id' | 'order'> | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ ...EMPTY_TESTIMONIAL });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function startEdit(t: Testimonial) {
    setEditingId(t.id);
    setEditForm({ name: t.name, location: t.location, text: t.text, stars: t.stars, active: t.active });
    setShowCreate(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function saveEdit(id: string) {
    if (!editForm) return;
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      setList((prev) => prev.map((t) => t.id === id ? { ...t, ...editForm } : t));
      cancelEdit();
      showSuccess('Témoignage mis à jour!');
    } catch {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTestimonial(id: string) {
    if (!confirm('Supprimer ce témoignage?')) return;
    setDeletingId(id); setError('');
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setList((prev) => prev.filter((t) => t.id !== id));
      showSuccess('Témoignage supprimé.');
    } catch {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  }

  async function createTestimonial() {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) throw new Error();
      const created: Testimonial = await res.json();
      setList((prev) => [...prev, created]);
      setShowCreate(false);
      setCreateForm({ ...EMPTY_TESTIMONIAL });
      showSuccess('Témoignage ajouté!');
    } catch {
      setError('Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
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

      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); setEditForm(null); }}
          className="btn-outline-gold flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter un témoignage
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card-dark p-5 border border-brand-gold/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-brand-cream">Nouveau témoignage</h4>
            <button onClick={() => setShowCreate(false)} className="text-brand-cream-muted hover:text-brand-cream">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-brand-cream-muted mb-1">Nom</label>
              <input className="input-dark" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Jean Tremblay" />
            </div>
            <div>
              <label className="block text-xs text-brand-cream-muted mb-1">Ville</label>
              <input className="input-dark" value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} placeholder="Montréal, QC" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-brand-cream-muted mb-1">Témoignage</label>
            <textarea className="input-dark resize-none" rows={3} value={createForm.text} onChange={(e) => setCreateForm({ ...createForm, text: e.target.value })} placeholder="Excellent service..." />
          </div>
          <div className="flex items-center gap-6">
            <div>
              <label className="block text-xs text-brand-cream-muted mb-1.5">Étoiles</label>
              <StarSelector value={createForm.stars} onChange={(v) => setCreateForm({ ...createForm, stars: v })} />
            </div>
            <div>
              <label className="block text-xs text-brand-cream-muted mb-1.5">Actif</label>
              <Toggle value={createForm.active} onChange={(v) => setCreateForm({ ...createForm, active: v })} />
            </div>
          </div>
          <button onClick={createTestimonial} disabled={saving} className="btn-gold flex items-center gap-2 text-sm disabled:opacity-60">
            {saving ? <span className="inline-block w-3.5 h-3.5 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Créer
          </button>
        </div>
      )}

      {/* List */}
      {list.length === 0 && (
        <div className="card-dark p-8 text-center text-brand-cream-muted">Aucun témoignage</div>
      )}

      {list.map((t) => (
        <div key={t.id} className={`card-dark p-5 ${!t.active ? 'opacity-60' : ''}`}>
          {editingId === t.id && editForm ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-brand-cream-muted mb-1">Nom</label>
                  <input className="input-dark" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream-muted mb-1">Ville</label>
                  <input className="input-dark" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-brand-cream-muted mb-1">Témoignage</label>
                <textarea className="input-dark resize-none" rows={3} value={editForm.text} onChange={(e) => setEditForm({ ...editForm, text: e.target.value })} />
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-xs text-brand-cream-muted mb-1.5">Étoiles</label>
                  <StarSelector value={editForm.stars} onChange={(v) => setEditForm({ ...editForm, stars: v })} />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream-muted mb-1.5">Actif</label>
                  <Toggle value={editForm.active} onChange={(v) => setEditForm({ ...editForm, active: v })} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveEdit(t.id)} disabled={saving} className="btn-gold flex items-center gap-1.5 text-sm py-1.5 disabled:opacity-60">
                  {saving ? <span className="inline-block w-3 h-3 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Sauvegarder
                </button>
                <button onClick={cancelEdit} className="btn-ghost text-sm py-1.5">Annuler</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-brand-cream text-sm font-medium">{t.name}</span>
                  {t.location && <span className="text-brand-cream-muted/60 text-xs">— {t.location}</span>}
                  {!t.active && <span className="text-xs bg-brand-black-border text-brand-cream-muted px-2 py-0.5 rounded-full">Inactif</span>}
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`text-sm ${n <= t.stars ? 'text-brand-gold' : 'text-brand-black-border'}`}>★</span>
                  ))}
                </div>
                <p className="text-brand-cream-muted text-sm leading-relaxed line-clamp-2">{t.text}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg text-brand-cream-muted hover:text-brand-cream hover:bg-white/5 transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteTestimonial(t.id)} disabled={deletingId === t.id} className="p-1.5 rounded-lg text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── FAQ TAB ─── */
const EMPTY_FAQ = { questionFr: '', questionEn: '', answerFr: '', answerEn: '', active: true };

function FAQTab({ initialFaqs }: { initialFaqs: FAQ[] }) {
  const [list, setList] = useState<FAQ[]>(initialFaqs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<FAQ, 'id' | 'order'> | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ ...EMPTY_FAQ });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function startEdit(f: FAQ) {
    setEditingId(f.id);
    setEditForm({ questionFr: f.questionFr, questionEn: f.questionEn, answerFr: f.answerFr, answerEn: f.answerEn, active: f.active });
    setShowCreate(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function saveEdit(id: string) {
    if (!editForm) return;
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      setList((prev) => prev.map((f) => f.id === id ? { ...f, ...editForm } : f));
      cancelEdit();
      showSuccess('FAQ mise à jour!');
    } catch {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteFaq(id: string) {
    if (!confirm('Supprimer cette FAQ?')) return;
    setDeletingId(id); setError('');
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setList((prev) => prev.filter((f) => f.id !== id));
      showSuccess('FAQ supprimée.');
    } catch {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  }

  async function createFaq() {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) throw new Error();
      const created: FAQ = await res.json();
      setList((prev) => [...prev, created]);
      setShowCreate(false);
      setCreateForm({ ...EMPTY_FAQ });
      showSuccess('FAQ ajoutée!');
    } catch {
      setError('Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  }

  function FAQFormFields({
    form,
    onChange,
  }: {
    form: typeof EMPTY_FAQ;
    onChange: (f: typeof EMPTY_FAQ) => void;
  }) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-brand-cream-muted mb-1">Question (FR)</label>
            <input className="input-dark" value={form.questionFr} onChange={(e) => onChange({ ...form, questionFr: e.target.value })} placeholder="Quel est votre délai..." />
          </div>
          <div>
            <label className="block text-xs text-brand-cream-muted mb-1">Question (EN)</label>
            <input className="input-dark" value={form.questionEn} onChange={(e) => onChange({ ...form, questionEn: e.target.value })} placeholder="What is your turnaround..." />
          </div>
        </div>
        <div>
          <label className="block text-xs text-brand-cream-muted mb-1">Réponse (FR)</label>
          <textarea className="input-dark resize-none" rows={2} value={form.answerFr} onChange={(e) => onChange({ ...form, answerFr: e.target.value })} placeholder="Réponse en français..." />
        </div>
        <div>
          <label className="block text-xs text-brand-cream-muted mb-1">Réponse (EN)</label>
          <textarea className="input-dark resize-none" rows={2} value={form.answerEn} onChange={(e) => onChange({ ...form, answerEn: e.target.value })} placeholder="Answer in English..." />
        </div>
        <div>
          <label className="block text-xs text-brand-cream-muted mb-1.5">Actif</label>
          <Toggle value={form.active} onChange={(v) => onChange({ ...form, active: v })} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
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

      <div className="flex justify-end">
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); setEditForm(null); }}
          className="btn-outline-gold flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter une FAQ
        </button>
      </div>

      {showCreate && (
        <div className="card-dark p-5 border border-brand-gold/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-brand-cream">Nouvelle FAQ</h4>
            <button onClick={() => setShowCreate(false)} className="text-brand-cream-muted hover:text-brand-cream">
              <X className="w-4 h-4" />
            </button>
          </div>
          <FAQFormFields form={createForm} onChange={setCreateForm} />
          <button onClick={createFaq} disabled={saving} className="btn-gold flex items-center gap-1.5 text-sm disabled:opacity-60">
            {saving ? <span className="inline-block w-3.5 h-3.5 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Créer
          </button>
        </div>
      )}

      {list.length === 0 && (
        <div className="card-dark p-8 text-center text-brand-cream-muted">Aucune FAQ</div>
      )}

      {list.map((f) => (
        <div key={f.id} className={`card-dark p-5 ${!f.active ? 'opacity-60' : ''}`}>
          {editingId === f.id && editForm ? (
            <div className="space-y-3">
              <FAQFormFields
                form={editForm as typeof EMPTY_FAQ}
                onChange={(val) => setEditForm(val as Omit<FAQ, 'id' | 'order'>)}
              />
              <div className="flex gap-2">
                <button onClick={() => saveEdit(f.id)} disabled={saving} className="btn-gold flex items-center gap-1.5 text-sm py-1.5 disabled:opacity-60">
                  {saving ? <span className="inline-block w-3 h-3 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Sauvegarder
                </button>
                <button onClick={cancelEdit} className="btn-ghost text-sm py-1.5">Annuler</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-brand-cream text-sm font-medium">{f.questionFr || f.questionEn}</span>
                  {!f.active && <span className="text-xs bg-brand-black-border text-brand-cream-muted px-2 py-0.5 rounded-full">Inactif</span>}
                </div>
                <p className="text-brand-cream-muted text-sm leading-relaxed line-clamp-2">{f.answerFr || f.answerEn}</p>
                {f.questionEn && f.questionFr !== f.questionEn && (
                  <p className="text-brand-cream-muted/50 text-xs mt-1">EN: {f.questionEn}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => startEdit(f)} className="p-1.5 rounded-lg text-brand-cream-muted hover:text-brand-cream hover:bg-white/5 transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteFaq(f.id)} disabled={deletingId === f.id} className="p-1.5 rounded-lg text-brand-cream-muted hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function ContentManager({ settings, testimonials, faqs }: ContentManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('hero');

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-brand-black-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px
              ${activeTab === tab
                ? 'text-brand-gold border-brand-gold'
                : 'text-brand-cream-muted border-transparent hover:text-brand-cream'
              }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'hero' && <HeroTab settings={settings} />}
      {activeTab === 'testimonials' && <TestimonialsTab initialTestimonials={testimonials} />}
      {activeTab === 'faqs' && <FAQTab initialFaqs={faqs} />}
    </div>
  );
}
