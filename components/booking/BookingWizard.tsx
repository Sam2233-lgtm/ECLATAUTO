'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
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

function getVehicleEmoji(nameFr: string): string {
  const n = nameFr.toLowerCase();
  if (n.includes('pick') || n.includes('camion') || n.includes('truck')) return '🛻';
  if (n.includes('fourgon') || n.includes('van') || n.includes('minivan')) return '🚐';
  if (n.includes('vus') || n.includes('suv') || n.includes('crossover')) return '🚙';
  return '🚗';
}

function getPriceForCategory(service: DbService, categoryId: string): number | null {
  const pricing = service.pricing as Record<string, number> | null;
  const price = pricing?.[categoryId];
  if (!price || price === 0) return null;
  return price;
}

function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}
function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 10;
}
function isValidPostalCode(code: string): boolean {
  const clean = code.replace(/[\s\-]/g, '');
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/i.test(clean);
}

const STEP_LABELS = ['Véhicule', 'Service', 'Suppléments', 'Date & heure', 'Coordonnées', 'Confirmation'];

export default function BookingWizard({
  locale,
  services,
  categories,
}: {
  locale: string;
  services: DbService[];
  categories: VehicleCategory[];
}) {
  const tCommon = useTranslations('common');
  const isFr = locale === 'fr';

  const wizardRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
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

  const selectedService = services.find((s) => s.id === selectedServiceId) || null;
  const servicePrice = selectedService && selectedCategoryId ? getPriceForCategory(selectedService, selectedCategoryId) : null;
  const finalServicePrice = selectedService && servicePrice !== null
    ? (selectedService.promotion ? parseFloat(calcPromoPrice(servicePrice, selectedService.promotion).toFixed(2)) : servicePrice)
    : 0;
  const supplementsTotal = selectedSupplements.reduce((sum, s) => sum + s.price, 0);
  const total = parseFloat((finalServicePrice + supplementsTotal).toFixed(2));

  // Scroll wizard to top on every step change
  useEffect(() => {
    wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  useEffect(() => {
    fetch('/api/public/supplements').then(r => r.json()).then(d => { if (Array.isArray(d)) setSupplements(d); }).catch(() => {});
    fetch('/api/public/blocked-dates').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setBlockedDates(d);
      else if (Array.isArray(d?.data)) setBlockedDates(d.data);
    }).catch(() => {});
  }, []);

  const fullyBlockedDates = new Set(blockedDates.filter(b => b.timeSlot === null).map(b => b.date));
  const blockedSlotsForDate = new Set(blockedDates.filter(b => b.date === date && b.timeSlot !== null).map(b => b.timeSlot as string));
  const availableTimeSlots = TIME_SLOTS.filter(s => !blockedSlotsForDate.has(s));

  function toggleSupplement(supp: Supplement) {
    setSelectedSupplements(prev => {
      const exists = prev.find(s => s.id === supp.id);
      if (exists) return prev.filter(s => s.id !== supp.id);
      return [...prev, { id: supp.id, nameFr: supp.nameFr, nameEn: supp.nameEn, price: supp.price }];
    });
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return selectedCategoryId !== null;
      case 1: return selectedServiceId !== null && servicePrice !== null;
      case 2: return true; // supplements optional
      case 3: return date !== '' && timeSlot !== '' && !fullyBlockedDates.has(date);
      case 4: {
        const r = ['firstName','lastName','phone','email','address','city','postalCode'];
        if (!r.every(f => contact[f as keyof typeof contact].trim() !== '')) return false;
        if (!isValidEmail(contact.email)) return false;
        if (!isValidPhone(contact.phone)) return false;
        if (!isValidPostalCode(contact.postalCode)) return false;
        return true;
      }
      default: return true;
    }
  }

  function handleNext() {
    if (step === 4) {
      const errors: Record<string, string> = {};
      const required = ['firstName', 'lastName', 'phone', 'email', 'address', 'city', 'postalCode'] as const;
      required.forEach(f => {
        if (!contact[f].trim()) errors[f] = isFr ? 'Ce champ est requis' : 'Required';
      });
      if (!errors.email && !isValidEmail(contact.email)) errors.email = isFr ? 'Courriel invalide' : 'Invalid email';
      if (!errors.phone && !isValidPhone(contact.phone)) errors.phone = isFr ? 'Téléphone invalide (10 chiffres min.)' : 'Invalid phone (min. 10 digits)';
      if (!errors.postalCode && !isValidPostalCode(contact.postalCode)) errors.postalCode = isFr ? 'Code postal invalide (ex: H2X 1Y3)' : 'Invalid postal code (e.g. H2X 1Y3)';
      if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
      setFieldErrors({});
    }
    setStep(s => s + 1);
  }

  async function handleSubmit() {
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
      } else {
        setError(isFr ? 'Erreur lors de la réservation. Veuillez réessayer.' : 'Booking error. Please try again.');
      }
    } catch {
      setError(isFr ? 'Erreur de connexion.' : 'Connection error.');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedId) {
    const displayRef = confirmationNumber || confirmedId.slice(-8).toUpperCase();
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-brand-cream mb-3">
          {isFr ? 'Réservation reçue !' : 'Booking received!'}
        </h2>
        <p className="text-brand-cream-muted mb-6 leading-relaxed">
          {isFr ? 'Vous recevrez un email de confirmation. Nous vous contacterons dans les 24h pour confirmer votre rendez-vous.' : 'You will receive a confirmation email. We will contact you within 24h to confirm your appointment.'}
        </p>
        <div className="card-dark p-4 mb-4">
          <p className="text-brand-cream-muted text-sm">{isFr ? 'Numéro de référence' : 'Reference number'}</p>
          <p className="text-brand-gold font-mono font-bold mt-1 text-lg">{displayRef}</p>
        </div>
        <div className="card-dark p-4 mb-8 text-left text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-brand-cream-muted">{isFr ? 'Service' : 'Service'}</span>
            <span className="text-brand-cream">{isFr ? selectedService?.nameFr : selectedService?.nameEn}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-brand-cream-muted">{isFr ? 'Véhicule' : 'Vehicle'}</span>
            <span className="text-brand-cream">{selectedCategoryName}</span>
          </div>
          <div className="flex justify-between font-bold text-brand-gold border-t border-brand-black-border mt-2 pt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={() => { setStep(0); setSelectedCategoryId(null); setSelectedServiceId(null); setSelectedSupplements([]); setDate(''); setTimeSlot(''); setContact({ firstName:'',lastName:'',phone:'',email:'',address:'',city:'',postalCode:'',vehicleMake:'',vehicleModel:'',vehicleYear:'',vehicleColor:'',notes:'' }); setConfirmedId(null); setConfirmationNumber(null); }} className="btn-outline-gold">
          {isFr ? 'Nouvelle réservation' : 'New booking'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto" ref={wizardRef}>
      {/* Progress */}
      <div className="flex items-center justify-between mb-10 px-2 overflow-x-auto">
        {STEP_LABELS.map((label, index) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${index < step ? 'bg-brand-gold text-brand-black' : index === step ? 'bg-brand-gold/20 border-2 border-brand-gold text-brand-gold' : 'bg-brand-black-card border border-brand-black-border text-brand-cream-muted'}`}>
                {index < step ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block whitespace-nowrap ${index === step ? 'text-brand-gold' : 'text-brand-cream-muted'}`}>{label}</span>
            </div>
            {index < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-px mx-2 transition-colors duration-300 ${index < step ? 'bg-brand-gold/40' : 'bg-brand-black-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card-dark p-6 sm:p-8 pb-28 md:pb-8">

        {/* STEP 0: Vehicle type */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">{isFr ? 'Quel est votre type de véhicule ?' : 'What is your vehicle type?'}</h2>
            <p className="text-brand-cream-muted text-sm mb-6">{isFr ? 'Le prix varie selon le format de votre véhicule.' : 'Price varies based on your vehicle size.'}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const emoji = getVehicleEmoji(cat.nameFr);
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button key={cat.id} onClick={() => { setSelectedCategoryId(cat.id); setSelectedCategoryName(isFr ? cat.nameFr : cat.nameEn); setSelectedServiceId(null); }}
                    className={`p-5 rounded-xl border transition-all duration-200 text-center flex flex-col items-center gap-3 ${isSelected ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-black-border hover:border-brand-gold/40 hover:bg-white/5'}`}>
                    <span className="text-4xl">{emoji}</span>
                    <span className="font-semibold text-brand-cream text-sm">{isFr ? cat.nameFr : cat.nameEn}</span>
                    {isSelected && <Check className="w-4 h-4 text-brand-gold" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1: Service */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">{isFr ? 'Choisissez votre service' : 'Choose your service'}</h2>
            <p className="text-brand-cream-muted text-sm mb-6">
              {isFr ? `Prix pour : ${selectedCategoryName}` : `Price for: ${selectedCategoryName}`}
            </p>
            <div className="space-y-3">
              {services.map((service) => {
                const price = selectedCategoryId ? getPriceForCategory(service, selectedCategoryId) : null;
                if (price === null) return null;
                const promoPrice = service.promotion ? parseFloat(calcPromoPrice(price, service.promotion).toFixed(2)) : null;
                const includes = isFr ? service.includesFr : service.includesEn;
                const includesList = includes ? includes.split('\n').filter(Boolean) : [];
                const isSelected = selectedServiceId === service.id;
                return (
                  <button key={service.id} onClick={() => setSelectedServiceId(service.id)}
                    className={`w-full p-5 rounded-xl border transition-all duration-200 text-left ${isSelected ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-black-border hover:border-brand-gold/40 hover:bg-white/5'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-brand-cream">{isFr ? service.nameFr : service.nameEn}</span>
                          {isSelected && <Check className="w-4 h-4 text-brand-gold flex-shrink-0" />}
                        </div>
                        <p className="text-brand-cream-muted text-sm mb-3">{isFr ? service.descriptionFr : service.descriptionEn}</p>
                        {includesList.length > 0 && (
                          <ul className="space-y-1">
                            {includesList.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-brand-cream-muted/80">
                                <span className="w-1.5 h-1.5 bg-brand-gold rounded-full flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="text-brand-cream-muted/50 text-xs mt-2">{service.duration} min</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {promoPrice !== null ? (
                          <>
                            <div className="line-through text-brand-cream-muted text-sm">${price.toFixed(2)}</div>
                            <div className="text-brand-gold font-bold text-xl">${promoPrice.toFixed(2)}</div>
                          </>
                        ) : (
                          <div className="text-brand-gold font-bold text-xl">${price.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Supplements */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">{isFr ? 'Suppléments (optionnel)' : 'Add-ons (optional)'}</h2>
            <p className="text-brand-cream-muted text-sm mb-6">{isFr ? 'Ajoutez des services supplémentaires à votre réservation.' : 'Add extra services to your booking.'}</p>
            {supplements.length === 0 ? (
              <p className="text-brand-cream-muted text-center py-8">{isFr ? 'Aucun supplément disponible.' : 'No add-ons available.'}</p>
            ) : (
              <div className="space-y-3">
                {supplements.map((supp) => {
                  const isChecked = selectedSupplements.some(s => s.id === supp.id);
                  return (
                    <button key={supp.id} onClick={() => toggleSupplement(supp)}
                      className={`w-full p-4 rounded-xl border transition-all duration-200 text-left flex items-center gap-4 ${isChecked ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-black-border hover:border-brand-gold/40 hover:bg-white/5'}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${isChecked ? 'bg-brand-gold border-brand-gold' : 'border-brand-black-border'}`}>
                        {isChecked && <Check className="w-3 h-3 text-brand-black" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-brand-cream">{isFr ? supp.nameFr : supp.nameEn}</div>
                        {(isFr ? supp.descriptionFr : supp.descriptionEn) && (
                          <div className="text-brand-cream-muted text-xs mt-0.5">{isFr ? supp.descriptionFr : supp.descriptionEn}</div>
                        )}
                      </div>
                      <div className="text-brand-gold font-bold flex-shrink-0">+${supp.price.toFixed(2)}</div>
                    </button>
                  );
                })}
              </div>
            )}
            {/* Running total */}
            <div className="mt-6 p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-xl">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-brand-cream-muted">{isFr ? 'Service' : 'Service'}</span>
                <span className="text-brand-cream">${finalServicePrice.toFixed(2)}</span>
              </div>
              {selectedSupplements.map(s => (
                <div key={s.id} className="flex justify-between text-sm mb-1">
                  <span className="text-brand-cream-muted">{isFr ? s.nameFr : s.nameEn}</span>
                  <span className="text-brand-cream">+${s.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-brand-gold border-t border-brand-gold/20 mt-2 pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Date & time */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">{isFr ? 'Date et heure' : 'Date & Time'}</h2>
            <p className="text-brand-cream-muted text-sm mb-6">{isFr ? 'Choisissez quand vous souhaitez être servi.' : 'Choose when you would like to be served.'}</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-brand-cream-muted mb-2">{isFr ? 'Date' : 'Date'}</label>
                <input type="date" value={date} min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  onChange={(e) => { setDate(e.target.value); setTimeSlot(''); }}
                  className="input-dark" style={{ colorScheme: 'dark' }} />
                {date && fullyBlockedDates.has(date) && (
                  <p className="text-red-400 text-xs mt-2">{isFr ? 'Cette date est complètement réservée. Choisissez une autre date.' : 'This date is fully booked. Please choose another.'}</p>
                )}
              </div>
              {date && !fullyBlockedDates.has(date) && (
                <div>
                  <label className="block text-sm font-medium text-brand-cream-muted mb-2">{isFr ? 'Heure' : 'Time'}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableTimeSlots.map((slot) => (
                      <button key={slot} onClick={() => setTimeSlot(slot)}
                        className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${timeSlot === slot ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' : 'border-brand-black-border text-brand-cream-muted hover:border-brand-gold/40'}`}>
                        {slot}
                      </button>
                    ))}
                    {availableTimeSlots.length === 0 && <p className="col-span-4 text-brand-cream-muted text-sm">{isFr ? 'Aucun créneau disponible.' : 'No slots available.'}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Contact info */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">{isFr ? 'Vos coordonnées' : 'Your contact info'}</h2>
            <p className="text-brand-cream-muted text-sm mb-6">{isFr ? "Nous venons à votre adresse — assurez-vous qu'elle est correcte." : "We come to your address — make sure it's correct."}</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">{isFr ? 'Prénom *' : 'First name *'}</label>
                  <input className={`input-dark ${fieldErrors.firstName ? 'border-red-500' : ''}`} value={contact.firstName} onChange={e => { setContact(c => ({...c, firstName: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.firstName; return n; }); }} />
                  {fieldErrors.firstName && <p className="text-red-400 text-xs mt-1">{fieldErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">{isFr ? 'Nom *' : 'Last name *'}</label>
                  <input className={`input-dark ${fieldErrors.lastName ? 'border-red-500' : ''}`} value={contact.lastName} onChange={e => { setContact(c => ({...c, lastName: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.lastName; return n; }); }} />
                  {fieldErrors.lastName && <p className="text-red-400 text-xs mt-1">{fieldErrors.lastName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">{isFr ? 'Téléphone *' : 'Phone *'}</label>
                  <input className="input-dark" value={contact.phone} onChange={e => { setContact(c => ({...c, phone: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.phone; return n; }); }} placeholder="514-555-0000" />
                  {fieldErrors.phone && <p className="text-red-400 text-xs mt-1">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">{isFr ? 'Courriel *' : 'Email *'}</label>
                  <input className="input-dark" type="email" value={contact.email} onChange={e => { setContact(c => ({...c, email: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.email; return n; }); }} />
                  {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">{isFr ? 'Adresse de service *' : 'Service address *'}</label>
                <input className={`input-dark ${fieldErrors.address ? 'border-red-500' : ''}`} value={contact.address} onChange={e => { setContact(c => ({...c, address: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.address; return n; }); }} placeholder="123 rue Principale" />
                {fieldErrors.address && <p className="text-red-400 text-xs mt-1">{fieldErrors.address}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">{isFr ? 'Ville *' : 'City *'}</label>
                  <input className={`input-dark ${fieldErrors.city ? 'border-red-500' : ''}`} value={contact.city} onChange={e => { setContact(c => ({...c, city: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.city; return n; }); }} />
                  {fieldErrors.city && <p className="text-red-400 text-xs mt-1">{fieldErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">{isFr ? 'Code postal *' : 'Postal code *'}</label>
                  <input className="input-dark" value={contact.postalCode} onChange={e => { setContact(c => ({...c, postalCode: e.target.value})); setFieldErrors(p => { const n = {...p}; delete n.postalCode; return n; }); }} placeholder="H2X 1Y3" />
                  {fieldErrors.postalCode && <p className="text-red-400 text-xs mt-1">{fieldErrors.postalCode}</p>}
                </div>
              </div>
              <div className="border-t border-brand-black-border pt-4">
                <p className="text-xs font-medium text-brand-cream-muted mb-3">{isFr ? 'Informations sur le véhicule (optionnel)' : 'Vehicle information (optional)'}</p>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-dark text-sm" placeholder={isFr ? 'Marque (ex: Toyota)' : 'Make (e.g.: Toyota)'} value={contact.vehicleMake} onChange={e => setContact(c => ({...c, vehicleMake: e.target.value}))} />
                  <input className="input-dark text-sm" placeholder={isFr ? 'Modèle (ex: RAV4)' : 'Model (e.g.: RAV4)'} value={contact.vehicleModel} onChange={e => setContact(c => ({...c, vehicleModel: e.target.value}))} />
                  <input className="input-dark text-sm" placeholder={isFr ? 'Année (ex: 2022)' : 'Year (e.g.: 2022)'} value={contact.vehicleYear} onChange={e => setContact(c => ({...c, vehicleYear: e.target.value}))} />
                  <input className="input-dark text-sm" placeholder={isFr ? 'Couleur' : 'Color'} value={contact.vehicleColor} onChange={e => setContact(c => ({...c, vehicleColor: e.target.value}))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">{isFr ? 'Notes (optionnel)' : 'Notes (optional)'}</label>
                <textarea className="input-dark resize-none" rows={3} value={contact.notes} onChange={e => setContact(c => ({...c, notes: e.target.value}))} placeholder={isFr ? "Ex: porte bleue, chien à bord..." : "e.g.: blue door, dog on board..."} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Confirmation */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">{isFr ? 'Confirmer votre réservation' : 'Confirm your booking'}</h2>
            <p className="text-brand-cream-muted text-sm mb-6">{isFr ? 'Vérifiez les détails avant de confirmer.' : 'Review details before confirming.'}</p>
            <div className="space-y-3">
              <div className="card-dark p-4">
                <p className="text-xs text-brand-cream-muted uppercase tracking-wider mb-2">{isFr ? 'Véhicule' : 'Vehicle'}</p>
                <p className="text-brand-cream font-semibold">{selectedCategoryName}</p>
                {(contact.vehicleMake || contact.vehicleModel) && (
                  <p className="text-brand-cream-muted text-sm">{[contact.vehicleMake, contact.vehicleModel, contact.vehicleYear, contact.vehicleColor].filter(Boolean).join(' ')}</p>
                )}
              </div>
              <div className="card-dark p-4">
                <p className="text-xs text-brand-cream-muted uppercase tracking-wider mb-2">{isFr ? 'Service' : 'Service'}</p>
                <p className="text-brand-cream font-semibold">{isFr ? selectedService?.nameFr : selectedService?.nameEn}</p>
                <p className="text-brand-gold font-bold">${finalServicePrice.toFixed(2)}</p>
              </div>
              {selectedSupplements.length > 0 && (
                <div className="card-dark p-4">
                  <p className="text-xs text-brand-cream-muted uppercase tracking-wider mb-2">{isFr ? 'Suppléments' : 'Add-ons'}</p>
                  {selectedSupplements.map(s => (
                    <div key={s.id} className="flex justify-between text-sm mb-1">
                      <span className="text-brand-cream">{isFr ? s.nameFr : s.nameEn}</span>
                      <span className="text-brand-gold">+${s.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="card-dark p-4">
                <p className="text-xs text-brand-cream-muted uppercase tracking-wider mb-2">{isFr ? 'Date et heure' : 'Date & time'}</p>
                <p className="text-brand-cream font-semibold">{date} à {timeSlot}</p>
              </div>
              <div className="card-dark p-4">
                <p className="text-xs text-brand-cream-muted uppercase tracking-wider mb-2">{isFr ? 'Adresse de service' : 'Service address'}</p>
                <p className="text-brand-cream">{contact.firstName} {contact.lastName}</p>
                <p className="text-brand-cream-muted text-sm">{contact.address}, {contact.city} {contact.postalCode}</p>
                <p className="text-brand-cream-muted text-sm">{contact.phone} · {contact.email}</p>
              </div>
              <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-brand-cream font-bold text-lg">{isFr ? 'Total estimé' : 'Estimated total'}</span>
                  <span className="text-brand-gold font-bold text-2xl">${total.toFixed(2)}</span>
                </div>
                <p className="text-brand-cream-muted/60 text-xs mt-1">{isFr ? 'Paiement à la fin du service.' : 'Payment due at end of service.'}</p>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          </div>
        )}

        {/* Navigation — fixed on mobile so keyboard never covers it, static on desktop */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:static
                        flex items-center justify-between
                        bg-brand-black/95 backdrop-blur-md border-t border-brand-black-border
                        px-4 py-3
                        md:bg-transparent md:backdrop-blur-none md:border-t-0
                        md:mt-8 md:px-0 md:py-0">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${step === 0 ? 'opacity-0 pointer-events-none' : 'btn-ghost'}`}>
            <ChevronLeft className="w-4 h-4" />
            {isFr ? 'Retour' : 'Back'}
          </button>
          {step < 5 ? (
            <button onClick={handleNext} disabled={step !== 4 && !canProceed()}
              className="btn-gold flex items-center gap-2 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed">
              {step === 2 ? (isFr ? 'Continuer' : 'Continue') : (isFr ? 'Suivant' : 'Next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-gold flex items-center gap-2 min-h-[44px] disabled:opacity-60">
              {submitting ? <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              {isFr ? 'Confirmer la réservation' : 'Confirm booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
