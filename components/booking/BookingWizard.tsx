'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronRight, ChevronLeft, Car, Truck, Bus, CarFront, CalendarDays } from 'lucide-react';
import { TIME_SLOTS } from '@/lib/constants';
import { calcPromoPrice, type DbService } from '@/lib/db-services';

interface VehicleCategory {
  id: string;
  nameFr: string;
  nameEn: string;
}

interface Supplement {
  id: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  price: number;
}

interface SelectedSupplement {
  id: string;
  nameFr: string;
  nameEn: string;
  price: number;
}

interface BlockedDate {
  date: string;
  timeSlot: string | null;
}

function getVehicleIcon(nameFr: string) {
  const n = nameFr.toLowerCase();
  if (n.includes('pick') || n.includes('camion') || n.includes('truck')) return Truck;
  if (n.includes('fourgon') || n.includes('van') || n.includes('minivan')) return Bus;
  if (n.includes('vus') || n.includes('suv') || n.includes('crossover')) return CarFront;
  return Car;
}

function getPriceForCategory(service: DbService, categoryId: string): number | null {
  const pricing = service.pricing as Record<string, number> | null;
  const price = pricing?.[categoryId];
  if (!price || price === 0) return null;
  return price;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 10;
}
function isValidPostalCode(code: string): boolean {
  const clean = code.replace(/[\s\-]/g, '');
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/i.test(clean);
}

const STEP_LABELS_FR = ['Véhicule', 'Service', 'Date', 'Mes infos'];
const STEP_LABELS_EN = ['Vehicle', 'Service', 'Date', 'My info'];

export default function BookingWizard({
  locale,
  services,
  categories,
}: {
  locale: string;
  services: DbService[];
  categories: VehicleCategory[];
}) {
  const isFr = locale === 'fr';
  const STEP_LABELS = isFr ? STEP_LABELS_FR : STEP_LABELS_EN;

  const topRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedSupplements, setSelectedSupplements] = useState<SelectedSupplement[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [contact, setContact] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    address: '', city: '', postalCode: '',
    vehicleMake: '', vehicleModel: '', vehicleYear: '', vehicleColor: '',
    notes: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null);
  const [error, setError] = useState('');

  const selectedService = services.find(s => s.id === selectedServiceId) || null;
  const servicePrice = selectedService && selectedCategoryId
    ? getPriceForCategory(selectedService, selectedCategoryId)
    : null;
  const finalServicePrice = selectedService && servicePrice !== null
    ? (selectedService.promotion
        ? parseFloat(calcPromoPrice(servicePrice, selectedService.promotion).toFixed(2))
        : servicePrice)
    : 0;
  const supplementsTotal = selectedSupplements.reduce((sum, s) => sum + s.price, 0);
  const total = parseFloat((finalServicePrice + supplementsTotal).toFixed(2));

  useEffect(() => {
    fetch('/api/public/supplements')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setSupplements(d); })
      .catch(() => {});
    fetch('/api/public/blocked-dates')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setBlockedDates(d);
        else if (Array.isArray(d?.data)) setBlockedDates(d.data);
      })
      .catch(() => {});
  }, []);

  const fullyBlockedDates = new Set(
    blockedDates.filter(b => b.timeSlot === null).map(b => b.date)
  );
  const blockedSlotsForDate = new Set(
    blockedDates.filter(b => b.date === date && b.timeSlot !== null).map(b => b.timeSlot as string)
  );
  const availableTimeSlots = TIME_SLOTS.filter(s => !blockedSlotsForDate.has(s));

  function goToStep(next: number) {
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
  }

  function handleVehicleSelect(cat: VehicleCategory) {
    setSelectedCategoryId(cat.id);
    setSelectedCategoryName(isFr ? cat.nameFr : cat.nameEn);
    setSelectedServiceId(null);
    setSelectedSupplements([]);
    goToStep(1);
  }

  function toggleSupplement(supp: Supplement) {
    setSelectedSupplements(prev => {
      const exists = prev.find(s => s.id === supp.id);
      if (exists) return prev.filter(s => s.id !== supp.id);
      return [...prev, { id: supp.id, nameFr: supp.nameFr, nameEn: supp.nameEn, price: supp.price }];
    });
  }

  function canProceed(): boolean {
    switch (step) {
      case 1: return selectedServiceId !== null && servicePrice !== null;
      case 2: return date !== '' && timeSlot !== '' && !fullyBlockedDates.has(date);
      default: return true;
    }
  }

  async function handleSubmit() {
    const errors: Record<string, string> = {};
    const required = ['firstName', 'lastName', 'phone', 'email', 'address', 'city', 'postalCode'] as const;
    required.forEach(f => {
      if (!contact[f].trim()) errors[f] = isFr ? 'Requis' : 'Required';
    });
    if (!errors.email && !isValidEmail(contact.email))
      errors.email = isFr ? 'Courriel invalide' : 'Invalid email';
    if (!errors.phone && !isValidPhone(contact.phone))
      errors.phone = isFr ? 'Numéro invalide (10 chiffres)' : 'Invalid phone (10 digits)';
    if (!errors.postalCode && contact.postalCode.trim() && !isValidPostalCode(contact.postalCode))
      errors.postalCode = isFr ? 'Code postal invalide (ex: J3G 2A1)' : 'Invalid postal code (e.g. J3G 2A1)';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedServiceId,
          vehicleType: selectedCategoryName,
          vehicleMake: contact.vehicleMake,
          vehicleModel: contact.vehicleModel,
          vehicleYear: contact.vehicleYear,
          vehicleColor: contact.vehicleColor,
          date, timeSlot,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
          city: contact.city,
          postalCode: contact.postalCode,
          notes: contact.notes,
          supplements: selectedSupplements,
          price: total,
          locale,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setConfirmedId(json.id);
        setConfirmationNumber(json.confirmationNumber || null);
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.error('[BookingWizard] API error:', json);
        const apiError = json.error ?? (isFr ? 'Erreur lors de la réservation.' : 'Booking error.');
        setError(apiError);
      }
    } catch (err) {
      console.error('[BookingWizard] Network error:', err);
      setError(isFr ? 'Erreur de connexion. Vérifiez votre réseau et réessayez.' : 'Connection error. Check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── SUCCESS SCREEN ─── */
  if (confirmedId) {
    const displayRef = confirmationNumber || `EA-${confirmedId.slice(-6).toUpperCase()}`;
    return (
      <div className="max-w-md mx-auto text-center py-12 px-4" ref={topRef}>
        <div className="w-20 h-20 bg-brand-gold/10 border-2 border-brand-gold/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-brand-gold" />
        </div>
        <h2 className="text-3xl font-bold text-brand-cream mb-3">
          {isFr ? 'Réservation confirmée' : 'Booking confirmed'}
        </h2>
        <p className="text-brand-cream-muted mb-8 leading-relaxed">
          {isFr
            ? 'Nous vous contacterons dans les 24h pour confirmer votre rendez-vous.'
            : "We'll contact you within 24h to confirm your appointment."}
        </p>

        <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-6 mb-6 text-left">
          <p className="text-brand-cream-muted text-xs uppercase tracking-widest mb-1">
            {isFr ? 'Numéro de réservation' : 'Booking number'}
          </p>
          <p className="text-brand-gold font-mono font-bold text-2xl mb-5">{displayRef}</p>
          <div className="space-y-2 text-sm border-t border-brand-black-border pt-4">
            <div className="flex justify-between">
              <span className="text-brand-cream-muted">{isFr ? 'Service' : 'Service'}</span>
              <span className="text-brand-cream font-medium">
                {isFr ? selectedService?.nameFr : selectedService?.nameEn}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-cream-muted">{isFr ? 'Véhicule' : 'Vehicle'}</span>
              <span className="text-brand-cream">{selectedCategoryName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-cream-muted">Date</span>
              <span className="text-brand-cream">{date} — {timeSlot}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-brand-black-border pt-2 mt-1">
              <span className="text-brand-cream">Total</span>
              <span className="text-brand-gold">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setStep(0); setSelectedCategoryId(null); setSelectedCategoryName('');
            setSelectedServiceId(null); setSelectedSupplements([]);
            setDate(''); setTimeSlot('');
            setContact({ firstName:'',lastName:'',phone:'',email:'',address:'',city:'',postalCode:'',vehicleMake:'',vehicleModel:'',vehicleYear:'',vehicleColor:'',notes:'' });
            setConfirmedId(null); setConfirmationNumber(null);
          }}
          className="btn-outline-gold"
        >
          {isFr ? 'Nouvelle réservation' : 'New booking'}
        </button>
      </div>
    );
  }

  /* ─── WIZARD ─── */
  return (
    <div className="max-w-2xl mx-auto" ref={topRef}>

      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8 px-1">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < step
                  ? 'bg-brand-gold text-brand-black'
                  : i === step
                  ? 'bg-brand-gold/20 border-2 border-brand-gold text-brand-gold'
                  : 'bg-brand-black-card border border-brand-black-border text-brand-cream-muted'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block whitespace-nowrap font-medium ${
                i === step ? 'text-brand-gold' : 'text-brand-cream-muted'
              }`}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors duration-500 ${
                i < step ? 'bg-brand-gold' : 'bg-brand-black-border'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step card with fade animation */}
      <div className={`card-dark p-6 sm:p-8 pb-32 transition-all duration-200 ease-out ${
        animating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
      }`}>

        {/* ── ÉTAPE 1 : VÉHICULE ── */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">
              {isFr ? 'Quel est ton véhicule?' : 'What is your vehicle?'}
            </h2>
            <p className="text-brand-cream-muted text-sm mb-8">
              {isFr ? 'Sélectionne ton type — on avance automatiquement.' : 'Select your type — we move forward automatically.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map(cat => {
                const Icon = getVehicleIcon(cat.nameFr);
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleVehicleSelect(cat)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 text-center flex flex-col items-center gap-3 min-h-[120px] active:scale-95 ${
                      isSelected
                        ? 'border-brand-gold bg-brand-gold/10'
                        : 'border-brand-black-border hover:border-brand-gold/40 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-10 h-10 ${isSelected ? 'text-brand-gold' : 'text-brand-cream-muted'}`} strokeWidth={1.5} />
                    <span className="font-semibold text-brand-cream text-sm leading-tight">
                      {isFr ? cat.nameFr : cat.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : SERVICE + SUPPLÉMENTS ── */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">
              {isFr ? 'Choisis ton service' : 'Choose your service'}
            </h2>
            <p className="text-brand-cream-muted text-sm mb-6">
              {isFr ? `Prix pour : ${selectedCategoryName}` : `Price for: ${selectedCategoryName}`}
            </p>
            <div className="space-y-3">
              {services.map(service => {
                const price = selectedCategoryId ? getPriceForCategory(service, selectedCategoryId) : null;
                if (price === null) return null;
                const promoPrice = service.promotion
                  ? parseFloat(calcPromoPrice(price, service.promotion).toFixed(2))
                  : null;
                const isSelected = selectedServiceId === service.id;
                const includes = (isFr ? service.includesFr : service.includesEn)
                  ?.split('\n').filter(Boolean) || [];

                return (
                  <div key={service.id}>
                    <button
                      onClick={() => { setSelectedServiceId(service.id); setSelectedSupplements([]); }}
                      className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-brand-gold bg-brand-gold/10'
                          : 'border-brand-black-border hover:border-brand-gold/40 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isSelected && <Check className="w-4 h-4 text-brand-gold flex-shrink-0" />}
                            <span className="font-bold text-brand-cream text-lg leading-tight">
                              {isFr ? service.nameFr : service.nameEn}
                            </span>
                          </div>
                          <p className="text-brand-cream-muted text-sm mb-3">
                            {isFr ? service.descriptionFr : service.descriptionEn}
                          </p>
                          {includes.length > 0 && (
                            <ul className="space-y-1">
                              {includes.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-brand-cream-muted/80">
                                  <span className="w-1 h-1 bg-brand-gold rounded-full flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                          <p className="text-brand-cream-muted/40 text-xs mt-2">{service.duration} min</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {promoPrice !== null ? (
                            <>
                              <div className="line-through text-brand-cream-muted/50 text-sm">${price.toFixed(2)}</div>
                              <div className="text-brand-gold font-bold text-2xl">${promoPrice.toFixed(2)}</div>
                            </>
                          ) : (
                            <div className="text-brand-gold font-bold text-2xl">${price.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Suppléments inline sous le service sélectionné */}
                    {isSelected && supplements.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-brand-gold/30 space-y-2">
                        <p className="text-brand-cream-muted text-xs font-semibold uppercase tracking-widest pt-2 pb-1">
                          {isFr ? 'Ajouter des extras' : 'Add extras'}
                        </p>
                        {supplements.map(supp => {
                          const isChecked = selectedSupplements.some(s => s.id === supp.id);
                          return (
                            <button
                              key={supp.id}
                              onClick={() => toggleSupplement(supp)}
                              className={`w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3 min-h-[48px] ${
                                isChecked
                                  ? 'border-brand-gold/50 bg-brand-gold/8'
                                  : 'border-brand-black-border hover:border-brand-gold/30 hover:bg-white/3'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                                isChecked ? 'bg-brand-gold border-brand-gold' : 'border-brand-cream-muted/40'
                              }`}>
                                {isChecked && <Check className="w-3 h-3 text-brand-black" />}
                              </div>
                              <span className="flex-1 text-brand-cream text-sm">
                                {isFr ? supp.nameFr : supp.nameEn}
                              </span>
                              <span className="text-brand-gold font-semibold text-sm flex-shrink-0">
                                +${supp.price.toFixed(2)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : DATE & HEURE ── */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">
              {isFr ? 'Quand?' : 'When?'}
            </h2>
            <p className="text-brand-cream-muted text-sm mb-6">
              {isFr ? 'Choisis ta date, puis ton créneau horaire.' : 'Pick your date, then your time slot.'}
            </p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-brand-cream-muted mb-2">
                  {isFr ? 'Date' : 'Date'}
                </label>
                {/* Custom date display + native picker overlay — works on all browsers */}
                <div
                  className="relative cursor-pointer"
                  onClick={() => dateInputRef.current?.showPicker?.()}
                >
                  <div className="input-dark flex items-center justify-between pointer-events-none select-none">
                    <span className={date ? 'text-brand-cream font-medium' : 'text-brand-cream-muted/50'}>
                      {date
                        ? new Date(date + 'T12:00:00').toLocaleDateString(
                            isFr ? 'fr-CA' : 'en-CA',
                            { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
                          )
                        : isFr ? 'Choisir une date...' : 'Choose a date...'}
                    </span>
                    <CalendarDays className="w-5 h-5 text-brand-gold flex-shrink-0" />
                  </div>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={date}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    onChange={e => { setDate(e.target.value); setTimeSlot(''); }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                {date && fullyBlockedDates.has(date) && (
                  <p className="text-amber-400 text-sm mt-2">
                    {isFr ? 'Cette date est complète. Choisis une autre.' : 'Date fully booked. Choose another.'}
                  </p>
                )}
              </div>

              {date && !fullyBlockedDates.has(date) && (
                <div>
                  <label className="block text-sm font-medium text-brand-cream-muted mb-3">
                    {isFr ? 'Heure' : 'Time'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {availableTimeSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setTimeSlot(slot)}
                        className={`py-4 rounded-xl border-2 text-base font-bold min-h-[56px] transition-all active:scale-95 ${
                          timeSlot === slot
                            ? 'border-brand-gold bg-brand-gold text-brand-black'
                            : 'border-brand-black-border text-brand-cream hover:border-brand-gold/50 hover:bg-white/5'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                    {availableTimeSlots.length === 0 && (
                      <p className="col-span-4 text-brand-cream-muted text-sm">
                        {isFr ? 'Aucun créneau disponible pour cette date.' : 'No slots available for this date.'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 4 : COORDONNÉES + RÉCAP ── */}
        {step === 3 && (
          <div>
            {/* Récap mini en haut */}
            <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-4 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 text-sm min-w-0">
                  <div className="text-brand-cream font-semibold truncate">
                    {isFr ? selectedService?.nameFr : selectedService?.nameEn}
                  </div>
                  <div className="text-brand-cream-muted">
                    {selectedCategoryName} · {date} — {timeSlot}
                  </div>
                  {selectedSupplements.length > 0 && (
                    <div className="text-brand-cream-muted text-xs">
                      + {selectedSupplements.length} extra{selectedSupplements.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="text-brand-gold font-bold text-xl flex-shrink-0">
                  ${total.toFixed(2)}
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-brand-cream mb-1">
              {isFr ? 'Tes coordonnées' : 'Your info'}
            </h2>
            <p className="text-brand-cream-muted text-sm mb-6">
              {isFr ? "On vient chez toi — juste l'essentiel." : "We come to you — just the essentials."}
            </p>

            <div className="space-y-3">
              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className={`input-dark min-h-[48px] ${fieldErrors.firstName ? 'border-amber-500' : ''}`}
                    placeholder={isFr ? 'Prénom *' : 'First name *'}
                    autoComplete="given-name" name="firstName"
                    value={contact.firstName}
                    onChange={e => { setContact(c => ({...c, firstName: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.firstName; return n; }); }}
                  />
                  {fieldErrors.firstName && <p className="text-amber-400 text-xs mt-1">{fieldErrors.firstName}</p>}
                </div>
                <div>
                  <input
                    className={`input-dark min-h-[48px] ${fieldErrors.lastName ? 'border-amber-500' : ''}`}
                    placeholder={isFr ? 'Nom *' : 'Last name *'}
                    autoComplete="family-name" name="lastName"
                    value={contact.lastName}
                    onChange={e => { setContact(c => ({...c, lastName: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.lastName; return n; }); }}
                  />
                  {fieldErrors.lastName && <p className="text-amber-400 text-xs mt-1">{fieldErrors.lastName}</p>}
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <input
                  className={`input-dark min-h-[48px] ${fieldErrors.phone ? 'border-amber-500' : ''}`}
                  placeholder={isFr ? 'Téléphone *' : 'Phone *'}
                  type="tel" autoComplete="tel" name="phone" inputMode="tel"
                  value={contact.phone}
                  onChange={e => { setContact(c => ({...c, phone: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.phone; return n; }); }}
                />
                {fieldErrors.phone && <p className="text-amber-400 text-xs mt-1">{fieldErrors.phone}</p>}
              </div>

              {/* Courriel */}
              <div>
                <input
                  className={`input-dark min-h-[48px] ${fieldErrors.email ? 'border-amber-500' : ''}`}
                  placeholder={isFr ? 'Courriel *' : 'Email *'}
                  type="email" autoComplete="email" name="email" inputMode="email"
                  value={contact.email}
                  onChange={e => { setContact(c => ({...c, email: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.email; return n; }); }}
                />
                {fieldErrors.email && <p className="text-amber-400 text-xs mt-1">{fieldErrors.email}</p>}
              </div>

              {/* Adresse */}
              <div>
                <input
                  className={`input-dark min-h-[48px] ${fieldErrors.address ? 'border-amber-500' : ''}`}
                  placeholder={isFr ? 'Adresse *' : 'Address *'}
                  autoComplete="street-address" name="address"
                  value={contact.address}
                  onChange={e => { setContact(c => ({...c, address: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.address; return n; }); }}
                />
                {fieldErrors.address && <p className="text-amber-400 text-xs mt-1">{fieldErrors.address}</p>}
              </div>

              {/* Ville + Code postal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className={`input-dark min-h-[48px] ${fieldErrors.city ? 'border-amber-500' : ''}`}
                    placeholder={isFr ? 'Ville *' : 'City *'}
                    autoComplete="address-level2" name="city"
                    value={contact.city}
                    onChange={e => { setContact(c => ({...c, city: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.city; return n; }); }}
                  />
                  {fieldErrors.city && <p className="text-amber-400 text-xs mt-1">{fieldErrors.city}</p>}
                </div>
                <div>
                  <input
                    className={`input-dark min-h-[48px] ${fieldErrors.postalCode ? 'border-amber-500' : ''}`}
                    placeholder={isFr ? 'Code postal *' : 'Postal code *'}
                    autoComplete="postal-code" name="postalCode"
                    value={contact.postalCode}
                    onChange={e => { setContact(c => ({...c, postalCode: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.postalCode; return n; }); }}
                  />
                  {fieldErrors.postalCode && <p className="text-amber-400 text-xs mt-1">{fieldErrors.postalCode}</p>}
                </div>
              </div>

              {/* Détails véhicule — accordéon optionnel */}
              <details className="group">
                <summary className="flex items-center gap-2 text-brand-cream-muted text-sm cursor-pointer hover:text-brand-cream transition-colors list-none py-1 select-none">
                  <ChevronRight className="w-4 h-4 transition-transform duration-200 group-open:rotate-90 flex-shrink-0" />
                  {isFr ? 'Détails du véhicule (optionnel)' : 'Vehicle details (optional)'}
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <input className="input-dark text-sm min-h-[44px]" placeholder={isFr ? 'Marque' : 'Make'} value={contact.vehicleMake} onChange={e => setContact(c => ({...c, vehicleMake: e.target.value}))} />
                  <input className="input-dark text-sm min-h-[44px]" placeholder={isFr ? 'Modèle' : 'Model'} value={contact.vehicleModel} onChange={e => setContact(c => ({...c, vehicleModel: e.target.value}))} />
                  <input className="input-dark text-sm min-h-[44px]" placeholder={isFr ? 'Année' : 'Year'} value={contact.vehicleYear} onChange={e => setContact(c => ({...c, vehicleYear: e.target.value}))} />
                  <input className="input-dark text-sm min-h-[44px]" placeholder={isFr ? 'Couleur' : 'Color'} value={contact.vehicleColor} onChange={e => setContact(c => ({...c, vehicleColor: e.target.value}))} />
                </div>
              </details>

              {/* Notes */}
              <textarea
                className="input-dark resize-none text-sm"
                rows={2}
                placeholder={isFr ? 'Notes (optionnel) — porte bleue, chien...' : 'Notes (optional) — blue door, dog...'}
                value={contact.notes}
                onChange={e => setContact(c => ({...c, notes: e.target.value}))}
              />
            </div>

            {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
          </div>
        )}
      </div>

      {/* ── BARRE DE NAV STICKY — visible dès étape 2 ── */}
      {step >= 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand-black/98 backdrop-blur-md border-t border-brand-black-border">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* Retour */}
            <button
              onClick={() => goToStep(step - 1)}
              className="flex items-center justify-center w-12 h-12 rounded-xl border border-brand-black-border text-brand-cream-muted hover:text-brand-cream hover:border-brand-gold/40 transition-all flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Prix */}
            <div className="flex-1 min-w-0">
              <div className="text-brand-cream-muted text-xs leading-none mb-0.5">
                {isFr ? 'Total estimé' : 'Estimated total'}
              </div>
              <div className="text-brand-gold font-bold text-xl leading-none">
                ${total.toFixed(2)}
              </div>
            </div>

            {/* Suivant / Confirmer */}
            {step < 3 ? (
              <button
                onClick={() => canProceed() && goToStep(step + 1)}
                disabled={!canProceed()}
                className="btn-gold min-h-[48px] px-6 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isFr ? 'Suivant' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-gold min-h-[48px] px-6 flex items-center gap-2 disabled:opacity-60 flex-shrink-0 text-base font-bold"
              >
                {submitting
                  ? <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
                  : <Check className="w-4 h-4" />
                }
                {isFr ? 'Confirmer' : 'Confirm'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Indice étape 1 */}
      {step === 0 && (
        <p className="text-center text-brand-cream-muted/40 text-xs mt-4">
          {isFr ? 'Sélectionne ton véhicule pour continuer' : 'Select your vehicle to continue'}
        </p>
      )}
    </div>
  );
}
