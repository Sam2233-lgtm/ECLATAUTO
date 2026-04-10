'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Upload, Send, CheckCircle, X, Car } from 'lucide-react';

const VEHICLE_TYPES_FR = ['Compacte', 'Berline', 'VUS / SUV', 'Pickup / Camion', 'Fourgonnette / Van', 'Autre'];
const VEHICLE_TYPES_EN = ['Compact', 'Sedan', 'SUV / Crossover', 'Pickup / Truck', 'Minivan / Van', 'Other'];

export default function DevisPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';
  const isFr = locale === 'fr';

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    vehicleType: '', description: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 3 - photos.length);
    const combined = [...photos, ...newFiles].slice(0, 3);
    setPhotos(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  }

  function removePhoto(i: number) {
    const updated = photos.filter((_, idx) => idx !== i);
    setPhotos(updated);
    setPreviews(updated.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.description) {
      setError(isFr ? 'Tous les champs obligatoires doivent être remplis.' : 'All required fields must be filled.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      photos.forEach((f) => fd.append('photos', f));

      const res = await fetch('/api/public/quotes', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(isFr ? 'Une erreur est survenue. Veuillez réessayer.' : 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-black">
        <Header locale={locale} />
        <main className="pt-20">
          <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <CheckCircle className="w-16 h-16 text-brand-gold mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-brand-cream mb-4">
                {isFr ? 'Demande envoyée !' : 'Request sent!'}
              </h1>
              <p className="text-brand-cream-muted mb-8">
                {isFr
                  ? 'Nous avons bien reçu votre demande. Vous recevrez votre soumission par courriel dans les 24 heures.'
                  : 'We have received your request. You will receive your quote by email within 24 hours.'}
              </p>
              <Link href={`/${locale}`} className="btn-gold inline-flex items-center gap-2">
                {isFr ? '← Retour au site' : '← Back to site'}
              </Link>
            </div>
          </div>
        </main>
        <Footer locale={locale} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <Header locale={locale} />
      <main className="pt-20">
        <div className="py-16 px-4">
          <div className="text-center mb-12">
            <span className="text-brand-gold text-sm font-semibold uppercase tracking-widest">
              {isFr ? 'Soumission gratuite' : 'Free estimate'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-cream mt-2">
              {isFr ? 'Demandez votre devis' : 'Request a Quote'}
            </h1>
            <div className="gold-divider" />
            <p className="text-brand-cream-muted max-w-xl mx-auto">
              {isFr
                ? 'Pour les services personnalisés ou les situations particulières, envoyez-nous votre demande et nous vous répondrons sous 24h.'
                : 'For custom services or special situations, send us your request and we will respond within 24 hours.'}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="card-dark p-8 space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                    {isFr ? 'Prénom *' : 'First name *'}
                  </label>
                  <input
                    className="input-dark"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder={isFr ? 'Jean' : 'John'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                    {isFr ? 'Nom *' : 'Last name *'}
                  </label>
                  <input
                    className="input-dark"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder={isFr ? 'Tremblay' : 'Smith'}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                    {isFr ? 'Courriel *' : 'Email *'}
                  </label>
                  <input
                    type="email"
                    className="input-dark"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jean@exemple.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                    {isFr ? 'Téléphone *' : 'Phone *'}
                  </label>
                  <input
                    type="tel"
                    className="input-dark"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="514-555-0100"
                  />
                </div>
              </div>

              {/* Vehicle type */}
              <div>
                <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                  {isFr ? 'Type de véhicule' : 'Vehicle type'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(isFr ? VEHICLE_TYPES_FR : VEHICLE_TYPES_EN).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, vehicleType: type })}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all text-left
                        ${form.vehicleType === type
                          ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                          : 'border-brand-black-border bg-brand-black-soft text-brand-cream-muted hover:border-brand-gold/30 hover:text-brand-cream'
                        }`}
                    >
                      <Car className="w-4 h-4 flex-shrink-0" />
                      <span className="leading-tight">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                  {isFr ? 'Description de votre demande *' : 'Description of your request *'}
                </label>
                <textarea
                  className="input-dark resize-none"
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={isFr
                    ? 'Décrivez l\'état de votre véhicule, le service souhaité, et toute information pertinente...'
                    : 'Describe the condition of your vehicle, the service you need, and any relevant information...'
                  }
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                  {isFr ? 'Photos (optionnel, max 3)' : 'Photos (optional, max 3)'}
                </label>
                {previews.length > 0 && (
                  <div className="flex gap-3 mb-3 flex-wrap">
                    {previews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-brand-black-border" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {photos.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-brand-black-border text-brand-cream-muted hover:border-brand-gold/40 hover:text-brand-cream transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    {isFr ? 'Ajouter des photos' : 'Add photos'}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-gold flex items-center justify-center gap-2 py-3 disabled:opacity-60"
              >
                {submitting
                  ? <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
                  : <Send className="w-4 h-4" />
                }
                {isFr ? 'Envoyer ma demande' : 'Send my request'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
