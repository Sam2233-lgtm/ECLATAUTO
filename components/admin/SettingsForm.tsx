'use client';

import { useState } from 'react';
import { Instagram, Facebook, Phone, Mail, Save, Check, Clock, MapPin, MessageSquare, Lock, Eye, EyeOff, AlertTriangle, UserCog } from 'lucide-react';

interface SiteSettings {
  id: string;
  phone: string;
  email: string;
  adminEmail: string;
  instagramUrl: string;
  facebookUrl: string;
  heroBadge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  statClients: string;
  statYears: string;
  statRating: string;
  businessHours: string;
  serviceZone: string;
  bookingEnabled: boolean;
  confirmationMessage: string;
  updatedAt: Date;
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

export default function SettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const [form, setForm] = useState({ ...initialSettings });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Password section
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Email section
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showEmailPw, setShowEmailPw] = useState(false);

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

  async function handleEmailSave() {
    setEmailError(''); setEmailSaved(false);
    if (!emailForm.newEmail) { setEmailError('Veuillez entrer un nouveau courriel.'); return; }
    if (!emailForm.currentPassword) { setEmailError('Veuillez entrer votre mot de passe actuel.'); return; }

    setEmailLoading(true);
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Erreur');
      }
      setEmailSaved(true);
      setEmailForm({ newEmail: '', currentPassword: '' });
      setTimeout(() => setEmailSaved(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du changement de courriel.';
      setEmailError(msg);
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordSave() {
    setPwError(''); setPwSaved(false);

    if (!pwForm.currentPassword) { setPwError('Veuillez entrer votre mot de passe actuel.'); return; }
    if (pwForm.newPassword.length < 8) { setPwError('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return; }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) { setPwError('Les mots de passe ne correspondent pas.'); return; }

    setPwLoading(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erreur');
      }
      setPwSaved(true);
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe.';
      setPwError(msg);
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Section 1: Coordonnées */}
      <div className="card-dark p-6">
        <h2 className="text-lg font-semibold text-brand-cream mb-5 flex items-center gap-2">
          <Phone className="w-5 h-5 text-brand-gold" /> Coordonnées
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cream-muted/50" />
              <input
                className="input-dark pl-10"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="514-555-0100"
                type="tel"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Courriel public</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cream-muted/50" />
              <input
                className="input-dark pl-10"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="info@eclatauto.ca"
                type="email"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
              Courriel de notification admin
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cream-muted/50" />
              <input
                className="input-dark pl-10"
                value={form.adminEmail}
                onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                placeholder="admin@eclatauto.ca"
                type="email"
              />
            </div>
            <p className="text-brand-cream-muted/50 text-xs mt-1">
              Adresse qui reçoit les notifications de nouvelles réservations
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Réseaux sociaux */}
      <div className="card-dark p-6">
        <h2 className="text-lg font-semibold text-brand-cream mb-5 flex items-center gap-2">
          <Instagram className="w-5 h-5 text-brand-gold" /> Réseaux sociaux
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">URL Instagram</label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cream-muted/50" />
              <input
                className="input-dark pl-10"
                value={form.instagramUrl}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/eclatauto"
                type="url"
              />
            </div>
            <p className="text-brand-cream-muted/50 text-xs mt-1">S'affiche dans le footer du site</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">URL Facebook</label>
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cream-muted/50" />
              <input
                className="input-dark pl-10"
                value={form.facebookUrl}
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/eclatauto"
                type="url"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Disponibilité */}
      <div className="card-dark p-6">
        <h2 className="text-lg font-semibold text-brand-cream mb-5 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-gold" /> Disponibilité
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
              Heures d'ouverture
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cream-muted/50" />
              <input
                className="input-dark pl-10"
                value={form.businessHours}
                onChange={(e) => setForm({ ...form, businessHours: e.target.value })}
                placeholder="Lun–Sam : 8h00 – 18h00"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
              Zone de service
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cream-muted/50" />
              <input
                className="input-dark pl-10"
                value={form.serviceZone}
                onChange={(e) => setForm({ ...form, serviceZone: e.target.value })}
                placeholder="Grand Montréal & Laval"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-cream">Réservations en ligne</p>
                <p className="text-brand-cream-muted/60 text-xs mt-0.5">
                  Activer ou désactiver la prise de réservation sur le site
                </p>
              </div>
              <Toggle
                value={form.bookingEnabled}
                onChange={(v) => setForm({ ...form, bookingEnabled: v })}
              />
            </div>
            {!form.bookingEnabled && (
              <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">
                  Les réservations en ligne sont désactivées. Les clients ne peuvent pas réserver sur le site.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Messages aux clients */}
      <div className="card-dark p-6">
        <h2 className="text-lg font-semibold text-brand-cream mb-5 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-gold" /> Messages aux clients
        </h2>
        <div>
          <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
            Message de confirmation de réservation
          </label>
          <textarea
            className="input-dark resize-none"
            rows={4}
            value={form.confirmationMessage}
            onChange={(e) => setForm({ ...form, confirmationMessage: e.target.value })}
            placeholder="Merci pour votre réservation! Nous vous contacterons sous peu pour confirmer les détails."
          />
          <p className="text-brand-cream-muted/50 text-xs mt-1">
            Ce message s'affiche et/ou est envoyé par courriel après une réservation réussie
          </p>
        </div>
      </div>

      {/* Save button */}
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
        {saved ? 'Sauvegardé!' : 'Enregistrer les paramètres'}
      </button>

      {/* Section 5: Changer le courriel de connexion */}
      <div className="card-dark p-6">
        <h2 className="text-lg font-semibold text-brand-cream mb-1 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-brand-gold" /> Changer le courriel de connexion
        </h2>
        <p className="text-brand-cream-muted/50 text-xs mb-5">
          Courriel actuel : <span className="text-brand-cream-muted">{initialSettings.email || '—'}</span>
        </p>

        {emailError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{emailError}</p>
          </div>
        )}
        {emailSaved && (
          <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
            <p className="text-green-400 text-sm">Courriel changé avec succès! Reconnectez-vous avec votre nouveau courriel.</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Nouveau courriel</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cream-muted/50" />
              <input
                type="email"
                className="input-dark pl-10"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                placeholder="nouveau@courriel.com"
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Mot de passe actuel (confirmation)</label>
            <div className="relative">
              <input
                type={showEmailPw ? 'text' : 'password'}
                className="input-dark pr-10"
                value={emailForm.currentPassword}
                onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowEmailPw(!showEmailPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-cream-muted/50 hover:text-brand-cream-muted transition-colors"
              >
                {showEmailPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleEmailSave}
          disabled={emailLoading}
          className="btn-gold flex items-center gap-2 mt-5 disabled:opacity-60"
        >
          {emailLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
          ) : emailSaved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          {emailSaved ? 'Courriel changé!' : 'Changer le courriel'}
        </button>
      </div>

      {/* Section 6: Changer le mot de passe */}
      <div className="card-dark p-6">
        <h2 className="text-lg font-semibold text-brand-cream mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-gold" /> Changer le mot de passe
        </h2>

        {pwError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{pwError}</p>
          </div>
        )}
        {pwSaved && (
          <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
            <p className="text-green-400 text-sm">Mot de passe changé avec succès!</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                className="input-dark pr-10"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-cream-muted/50 hover:text-brand-cream-muted transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className="input-dark pr-10"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="Minimum 8 caractères"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-cream-muted/50 hover:text-brand-cream-muted transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwForm.newPassword.length > 0 && pwForm.newPassword.length < 8 && (
              <p className="text-red-400 text-xs mt-1">Minimum 8 caractères requis</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                className="input-dark pr-10"
                value={pwForm.confirmNewPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmNewPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-cream-muted/50 hover:text-brand-cream-muted transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwForm.confirmNewPassword.length > 0 && pwForm.newPassword !== pwForm.confirmNewPassword && (
              <p className="text-red-400 text-xs mt-1">Les mots de passe ne correspondent pas</p>
            )}
          </div>
        </div>

        <button
          onClick={handlePasswordSave}
          disabled={pwLoading}
          className="btn-gold flex items-center gap-2 mt-5 disabled:opacity-60"
        >
          {pwLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
          ) : pwSaved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          {pwSaved ? 'Mot de passe changé!' : 'Changer le mot de passe'}
        </button>
      </div>
    </div>
  );
}
