'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Search, CheckCircle, Clock, XCircle, Star, ArrowLeft, CalendarDays, MapPin, Car, User } from 'lucide-react';
import Link from 'next/link';

interface ReservationResult {
  confirmationNumber: string;
  firstName: string;
  lastName: string;
  service: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  date: string;
  timeSlot: string;
  address: string;
  city: string;
  postalCode: string;
  status: string;
  price: number;
  notes?: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  pending:   { fr: 'En attente',  en: 'Pending',   color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', icon: Clock },
  confirmed: { fr: 'Confirmée',   en: 'Confirmed', color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20',   icon: CheckCircle },
  completed: { fr: 'Complétée',   en: 'Completed', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', icon: Star },
  cancelled: { fr: 'Annulée',     en: 'Cancelled', color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',       icon: XCircle },
};

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function SuiviContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) ?? 'fr';
  const isFr = locale !== 'en';

  const [ref, setRef] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReservationResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const prefilledRef = searchParams?.get('ref');
    if (prefilledRef) setRef(prefilledRef.toUpperCase());
  }, [searchParams]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/public/reservation?ref=${encodeURIComponent(ref.trim().toUpperCase())}&email=${encodeURIComponent(email.trim())}`
      );
      if (res.status === 404) {
        setError(isFr ? 'Aucune réservation trouvée avec ce numéro et cet email.' : 'No reservation found with this number and email.');
        return;
      }
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError(isFr ? 'Une erreur est survenue. Veuillez réessayer.' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const statusInfo = result ? STATUS_CONFIG[result.status as keyof typeof STATUS_CONFIG] : null;
  const StatusIcon = statusInfo?.icon ?? Clock;

  return (
    <div className="min-h-screen bg-brand-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-brand-cream-muted hover:text-brand-cream text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {isFr ? "Retour à l'accueil" : 'Back to home'}
        </Link>

        <div className="text-center mb-10">
          <span className="text-3xl font-bold">
            <span className="text-brand-gold">Éclat</span>
            <span className="text-brand-cream"> Auto</span>
          </span>
          <h1 className="text-2xl font-bold text-brand-cream mt-4 mb-2">
            {isFr ? 'Suivi de réservation' : 'Reservation Tracking'}
          </h1>
          <p className="text-brand-cream-muted text-sm">
            {isFr
              ? 'Entrez votre numéro de confirmation et votre courriel pour voir le statut de votre réservation.'
              : 'Enter your confirmation number and email to check your reservation status.'}
          </p>
        </div>

        <div className="card-dark p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                {isFr ? 'Numéro de confirmation' : 'Confirmation Number'}
              </label>
              <input
                className="input-dark font-mono uppercase tracking-wider"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder="EA-000001"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                {isFr ? 'Votre courriel' : 'Your Email'}
              </label>
              <input
                type="email"
                className="input-dark"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isFr ? 'votre@courriel.com' : 'your@email.com'}
                required
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
                : <Search className="w-4 h-4" />}
              {isFr ? 'Rechercher' : 'Search'}
            </button>
          </form>
        </div>

        {result && statusInfo && (
          <div className="card-dark p-6 space-y-6">
            <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${statusInfo.bg}`}>
              <StatusIcon className={`w-6 h-6 ${statusInfo.color} flex-shrink-0`} />
              <div>
                <p className="text-brand-cream-muted text-xs">{isFr ? 'Statut actuel' : 'Current status'}</p>
                <p className={`text-lg font-bold ${statusInfo.color}`}>{isFr ? statusInfo.fr : statusInfo.en}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-brand-cream-muted text-xs">{isFr ? 'Référence' : 'Reference'}</p>
                <p className="font-mono text-brand-gold font-bold">{result.confirmationNumber}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> {isFr ? 'Client' : 'Client'}
              </h3>
              <p className="text-brand-cream font-medium">{result.firstName} {result.lastName}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Car className="w-4 h-4" /> {isFr ? 'Service & véhicule' : 'Service & vehicle'}
              </h3>
              <p className="text-brand-cream">{result.service}</p>
              {(result.vehicleMake || result.vehicleModel) && (
                <p className="text-brand-cream-muted text-sm mt-0.5">
                  {[result.vehicleMake, result.vehicleModel, result.vehicleYear].filter(Boolean).join(' ')}
                  {result.vehicleColor ? ` — ${result.vehicleColor}` : ''}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> {isFr ? 'Rendez-vous' : 'Appointment'}
              </h3>
              <p className="text-brand-cream">{formatDate(result.date)} à {result.timeSlot}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {isFr ? 'Adresse' : 'Address'}
              </h3>
              <p className="text-brand-cream">{result.address}</p>
              <p className="text-brand-cream-muted text-sm">{result.city}, {result.postalCode}</p>
            </div>

            <div className="flex items-center justify-between bg-brand-black rounded-xl px-5 py-4 border border-brand-black-border">
              <span className="text-brand-cream-muted text-sm">{isFr ? 'Prix estimé' : 'Estimated price'}</span>
              <span className="text-brand-gold text-xl font-bold">~{result.price}$</span>
            </div>

            {result.status === 'cancelled' && (
              <p className="text-brand-cream-muted text-sm text-center">
                {isFr
                  ? 'Votre réservation a été annulée. Pour toute question, contactez-nous.'
                  : 'Your reservation has been cancelled. For any questions, contact us.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuiviPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <span className="inline-block w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
      </div>
    }>
      <SuiviContent />
    </Suspense>
  );
}
