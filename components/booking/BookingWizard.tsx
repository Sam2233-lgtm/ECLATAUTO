'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Check, MapPin } from 'lucide-react';
import { VEHICLE_TYPES, VEHICLE_TYPE_LABELS, TIME_SLOTS, getPriceForVehicle, type VehicleType } from '@/lib/constants';
import { calcPromoPrice, type DbService } from '@/lib/db-services';

interface BookingData {
  service: string;
  vehicleType: VehicleType | '';
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  date: string;
  timeSlot: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

const INITIAL_DATA: BookingData = {
  service: '',
  vehicleType: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  vehicleColor: '',
  date: '',
  timeSlot: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  notes: '',
};

const STEP_KEYS = ['service', 'vehicle', 'datetime', 'contact', 'confirm'] as const;

interface BlockedDate {
  date: string;
  timeSlot: string | null;
}

function getDisplayPrice(
  service: DbService,
  vehicleType: VehicleType | ''
): { base: number; promo: number | null } {
  const base = vehicleType
    ? getPriceForVehicle(service.basePrice, vehicleType, service.pricing)
    : service.basePrice;
  const promo = service.promotion
    ? Math.round(calcPromoPrice(base, service.promotion))
    : null;
  return { base, promo };
}

function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

function isValidPostalCode(code: string): boolean {
  return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(code);
}

export default function BookingWizard({
  locale,
  services,
}: {
  locale: string;
  services: DbService[];
}) {
  const t = useTranslations('booking');
  const tCommon = useTranslations('common');
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BookingData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  const isFr = locale === 'fr';

  const selectedService = services.find((s) => s.id === data.service) || null;

  // Fetch blocked dates on mount
  useEffect(() => {
    fetch('/api/public/blocked-dates')
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json)) setBlockedDates(json);
        else if (Array.isArray(json.data)) setBlockedDates(json.data);
      })
      .catch(() => {
        // silently fail — don't block booking if fetch fails
      });
  }, []);

  // Derived: set of dates that are fully blocked (all time slots or null slot = full day)
  const fullyBlockedDates = new Set(
    blockedDates.filter((b) => b.timeSlot === null).map((b) => b.date)
  );

  // Blocked time slots for the selected date
  const blockedSlotsForDate = new Set(
    blockedDates
      .filter((b) => b.date === data.date && b.timeSlot !== null)
      .map((b) => b.timeSlot as string)
  );

  // Available time slots (excluding fully blocked ones for the selected date)
  const availableTimeSlots = TIME_SLOTS.filter(
    (slot) => !blockedSlotsForDate.has(slot)
  );

  function update(field: keyof BookingData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user updates value
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validateContactFields(): Record<string, string> {
    const errors: Record<string, string> = {};

    if (data.email && !isValidEmail(data.email)) {
      errors.email = isFr
        ? 'Adresse courriel invalide.'
        : 'Invalid email address.';
    }
    if (data.phone && !isValidPhone(data.phone)) {
      errors.phone = isFr
        ? 'Numéro de téléphone invalide (10 chiffres min).'
        : 'Invalid phone number (min 10 digits).';
    }
    if (data.postalCode && !isValidPostalCode(data.postalCode)) {
      errors.postalCode = isFr
        ? 'Code postal invalide (ex: H2X 1Y3).'
        : 'Invalid postal code (e.g. H2X 1Y3).';
    }

    return errors;
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return data.service !== '';
      case 1:
        return data.vehicleType !== '';
      case 2:
        return (
          data.date !== '' &&
          data.timeSlot !== '' &&
          !fullyBlockedDates.has(data.date)
        );
      case 3: {
        const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
        const allFilled = required.every(
          (f) => data[f as keyof BookingData].trim() !== ''
        );
        if (!allFilled) return false;
        // Format validation
        if (!isValidEmail(data.email)) return false;
        if (!isValidPhone(data.phone)) return false;
        if (!isValidPostalCode(data.postalCode)) return false;
        return true;
      }
      default:
        return true;
    }
  }

  function handleNext() {
    if (step === 3) {
      const errors = validateContactFields();
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');

    // Compute price to pass to API
    let price: number | undefined;
    if (selectedService && data.vehicleType) {
      const prices = getDisplayPrice(selectedService, data.vehicleType as VehicleType);
      price = prices.promo !== null ? prices.promo : prices.base;
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale, price }),
      });
      const json = await res.json();
      if (json.success) {
        setConfirmedId(json.id);
        setConfirmationNumber(json.confirmationNumber || null);
      } else {
        setError(
          isFr
            ? 'Erreur lors de la réservation. Veuillez réessayer.'
            : 'Booking error. Please try again.'
        );
      }
    } catch {
      setError(isFr ? 'Erreur de connexion.' : 'Connection error.');
    } finally {
      setSubmitting(false);
    }
  }

  // SUCCESS
  if (confirmedId) {
    const displayRef = confirmationNumber || confirmedId.slice(-8).toUpperCase();
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-brand-cream mb-3">{t('success.title')}</h2>
        <p className="text-brand-cream-muted mb-6 leading-relaxed">{t('success.subtitle')}</p>
        <div className="card-dark p-4 mb-8">
          <p className="text-brand-cream-muted text-sm">{t('success.reference')}</p>
          <p className="text-brand-gold font-mono font-bold mt-1 text-lg">{displayRef}</p>
        </div>
        <button
          onClick={() => {
            setData(INITIAL_DATA);
            setStep(0);
            setConfirmedId(null);
            setConfirmationNumber(null);
          }}
          className="btn-outline-gold"
        >
          {t('success.newBooking')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress steps */}
      <div className="flex items-center justify-between mb-10 px-2">
        {STEP_KEYS.map((key, index) => (
          <div key={key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${
                    index < step
                      ? 'bg-brand-gold text-brand-black'
                      : index === step
                      ? 'bg-brand-gold/20 border-2 border-brand-gold text-brand-gold'
                      : 'bg-brand-black-card border border-brand-black-border text-brand-cream-muted'
                  }`}
              >
                {index < step ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  index === step ? 'text-brand-gold' : 'text-brand-cream-muted'
                }`}
              >
                {t(`steps.${key}`)}
              </span>
            </div>
            {index < STEP_KEYS.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 sm:mx-3 transition-colors duration-300 ${
                  index < step ? 'bg-brand-gold/40' : 'bg-brand-black-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="card-dark p-8">
        {/* STEP 0: Service */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">{t('service.title')}</h2>
            <p className="text-brand-cream-muted text-sm mb-6">{t('service.subtitle')}</p>
            {services.length === 0 ? (
              <p className="text-brand-cream-muted text-center py-8">
                {isFr ? 'Aucun service disponible pour le moment.' : 'No services available at the moment.'}
              </p>
            ) : (
              <div className="space-y-3">
                {services.map((service) => {
                  const name = isFr ? service.nameFr : service.nameEn;
                  const prices = getDisplayPrice(service, data.vehicleType);
                  const selected = data.service === service.id;
                  return (
                    <button
                      key={service.id}
                      onClick={() => update('service', service.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left
                        ${
                          selected
                            ? 'border-brand-gold bg-brand-gold/10'
                            : 'border-brand-black-border hover:border-brand-gold/40 hover:bg-white/5'
                        }`}
                    >
                      <div>
                        <div className="text-brand-cream font-semibold">{name}</div>
                        <div className="text-xs text-brand-cream-muted mt-0.5">{service.duration} min</div>
                        {service.promotion && (
                          <div className="text-brand-gold text-xs font-semibold mt-0.5">
                            🏷 {service.promotion.name}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        {(() => {
                          const minPrice = service.pricing
                            ? Math.min(...Object.values(service.pricing as Record<string, number>).filter(v => v > 0))
                            : service.basePrice;
                          const displayMin = isFinite(minPrice) ? minPrice : service.basePrice;
                          return service.promotion ? (
                            <div>
                              <div className="line-through text-brand-cream-muted text-xs">
                                {tCommon('currency')}{displayMin}
                              </div>
                              <div className="text-brand-gold font-bold">
                                {tCommon('from')} {tCommon('currency')}
                                {calcPromoPrice(displayMin, service.promotion)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-brand-gold font-bold">
                              {tCommon('from')} {tCommon('currency')}{displayMin}
                            </div>
                          );
                        })()}
                        {selected && <Check className="w-4 h-4 text-brand-gold ml-auto mt-1" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Vehicle type */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">{t('vehicle.title')}</h2>
            <p className="text-brand-cream-muted text-sm mb-6">{t('vehicle.subtitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VEHICLE_TYPES.map((type) => {
                const prices = selectedService ? getDisplayPrice(selectedService, type) : null;
                return (
                  <button
                    key={type}
                    onClick={() => update('vehicleType', type)}
                    className={`p-4 rounded-xl border transition-all duration-200 text-left
                      ${
                        data.vehicleType === type
                          ? 'border-brand-gold bg-brand-gold/10'
                          : 'border-brand-black-border hover:border-brand-gold/40 hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-cream">
                        {t(`vehicle.${type}` as any)}
                      </span>
                      {data.vehicleType === type && <Check className="w-4 h-4 text-brand-gold" />}
                    </div>
                    {prices &&
                      (prices.promo !== null ? (
                        <div className="mt-0.5">
                          <span className="line-through text-brand-cream-muted text-xs mr-1">
                            {tCommon('currency')}{prices.base}
                          </span>
                          <span className="text-brand-gold text-sm font-bold">
                            {tCommon('currency')}{prices.promo}
                          </span>
                        </div>
                      ) : (
                        <span className="text-brand-gold text-sm mt-0.5 block font-bold">
                          {tCommon('currency')}{prices.base}
                        </span>
                      ))}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">{t('datetime.title')}</h2>
            <p className="text-brand-cream-muted text-sm mb-6">{t('datetime.subtitle')}</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-brand-cream-muted mb-2">
                  {t('datetime.selectDate')}
                </label>
                <input
                  type="date"
                  value={data.date}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  onChange={(e) => {
                    update('date', e.target.value);
                    // Reset time slot if date changes
                    update('timeSlot', '');
                  }}
                  className="input-dark"
                  style={{ colorScheme: 'dark' }}
                />
                {data.date && fullyBlockedDates.has(data.date) && (
                  <p className="text-red-400 text-xs mt-2">
                    {isFr
                      ? 'Cette date est complètement réservée. Veuillez choisir une autre date.'
                      : 'This date is fully booked. Please choose another date.'}
                  </p>
                )}
                <p className="text-brand-cream-muted/60 text-xs mt-1.5">{t('datetime.noWeekends')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-cream-muted mb-2">
                  {t('datetime.selectTime')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => update('timeSlot', slot)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-all
                        ${
                          data.timeSlot === slot
                            ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                            : 'border-brand-black-border text-brand-cream-muted hover:border-brand-gold/40 hover:text-brand-cream'
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                  {availableTimeSlots.length === 0 && (
                    <p className="col-span-4 text-brand-cream-muted text-sm text-center py-4">
                      {isFr
                        ? 'Aucune plage horaire disponible pour cette date.'
                        : 'No time slots available for this date.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Contact & Vehicle Info */}
        {step === 3 && (
          <div>
            {/* "Nous venons à vous" banner */}
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-6">
              <MapPin className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm font-medium">
                {isFr
                  ? 'Nous nous déplaçons directement à votre adresse — entrez votre adresse ci-dessous'
                  : 'We come directly to your address — enter your address below'}
              </p>
            </div>

            <h2 className="text-2xl font-bold text-brand-cream mb-1">{t('contact.title')}</h2>
            <p className="text-brand-cream-muted text-sm mb-6">{t('contact.subtitle')}</p>

            <div className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                    {t('contact.firstName')} *
                  </label>
                  <input
                    type="text"
                    value={data.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    className="input-dark"
                    placeholder="Marie"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                    {t('contact.lastName')} *
                  </label>
                  <input
                    type="text"
                    value={data.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    className="input-dark"
                    placeholder="Tremblay"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                  {t('contact.email')} *
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={`input-dark ${fieldErrors.email ? 'border-red-500/50' : ''}`}
                  placeholder="marie@example.com"
                />
                {fieldErrors.email && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                  {t('contact.phone')} *
                </label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={`input-dark ${fieldErrors.phone ? 'border-red-500/50' : ''}`}
                  placeholder="514-555-0000"
                />
                {fieldErrors.phone && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                  {t('contact.address')} *
                </label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="input-dark"
                  placeholder="123 rue Principale"
                />
              </div>

              {/* City & Postal Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                    {t('contact.city')} *
                  </label>
                  <input
                    type="text"
                    value={data.city}
                    onChange={(e) => update('city', e.target.value)}
                    className="input-dark"
                    placeholder="Montréal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                    {t('contact.postalCode')} *
                  </label>
                  <input
                    type="text"
                    value={data.postalCode}
                    onChange={(e) => update('postalCode', e.target.value.toUpperCase())}
                    className={`input-dark ${fieldErrors.postalCode ? 'border-red-500/50' : ''}`}
                    placeholder="H2X 1Y3"
                  />
                  {fieldErrors.postalCode && (
                    <p className="text-red-400 text-xs mt-1">{fieldErrors.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Vehicle info section */}
              <div className="pt-2">
                <p className="text-brand-cream-muted text-xs font-semibold uppercase tracking-wider mb-3">
                  {isFr ? 'Informations sur le véhicule (optionnel)' : 'Vehicle Information (optional)'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                      {isFr ? 'Marque' : 'Make'}
                    </label>
                    <input
                      type="text"
                      value={data.vehicleMake}
                      onChange={(e) => update('vehicleMake', e.target.value)}
                      className="input-dark"
                      placeholder={isFr ? 'ex: Toyota' : 'e.g. Toyota'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                      {isFr ? 'Modèle' : 'Model'}
                    </label>
                    <input
                      type="text"
                      value={data.vehicleModel}
                      onChange={(e) => update('vehicleModel', e.target.value)}
                      className="input-dark"
                      placeholder={isFr ? 'ex: Corolla' : 'e.g. Corolla'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                      {isFr ? 'Année' : 'Year'}
                    </label>
                    <input
                      type="text"
                      value={data.vehicleYear}
                      onChange={(e) => update('vehicleYear', e.target.value)}
                      className="input-dark"
                      placeholder="2022"
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                      {isFr ? 'Couleur' : 'Color'}
                    </label>
                    <input
                      type="text"
                      value={data.vehicleColor}
                      onChange={(e) => update('vehicleColor', e.target.value)}
                      className="input-dark"
                      placeholder={isFr ? 'ex: Blanc' : 'e.g. White'}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">
                  {t('contact.notes')}
                </label>
                <textarea
                  value={data.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  className="input-dark resize-none"
                  rows={3}
                  placeholder={t('contact.notesPlaceholder')}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Confirm */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-brand-cream mb-1">{t('confirm.title')}</h2>
            <p className="text-brand-cream-muted text-sm mb-6">{t('confirm.subtitle')}</p>
            <div className="space-y-3 mb-6">
              {[
                {
                  label: t('confirm.service'),
                  value: selectedService
                    ? isFr
                      ? selectedService.nameFr
                      : selectedService.nameEn
                    : data.service,
                },
                {
                  label: t('confirm.vehicle'),
                  value: data.vehicleType ? t(`vehicle.${data.vehicleType}` as any) : '',
                },
                ...(data.vehicleMake || data.vehicleModel || data.vehicleYear || data.vehicleColor
                  ? [
                      {
                        label: isFr ? 'Détails du véhicule' : 'Vehicle Details',
                        value: [
                          data.vehicleYear,
                          data.vehicleMake,
                          data.vehicleModel,
                          data.vehicleColor ? `(${data.vehicleColor})` : '',
                        ]
                          .filter(Boolean)
                          .join(' '),
                      },
                    ]
                  : []),
                {
                  label: t('confirm.datetime'),
                  value: `${data.date} — ${data.timeSlot}`,
                },
                {
                  label: t('confirm.address'),
                  value: `${data.address}, ${data.city} ${data.postalCode}`,
                },
                {
                  label: t('confirm.contact'),
                  value: `${data.firstName} ${data.lastName} • ${data.email} • ${data.phone}`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 py-3 border-b border-brand-black-border last:border-0"
                >
                  <span className="text-brand-cream-muted text-sm flex-shrink-0">{label}</span>
                  <span className="text-brand-cream text-sm text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* Price estimate */}
            {selectedService &&
              data.vehicleType &&
              (() => {
                const prices = getDisplayPrice(selectedService, data.vehicleType as VehicleType);
                return (
                  <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-brand-cream font-semibold">{t('confirm.totalEstimate')}</span>
                      <div className="text-right">
                        {prices.promo !== null ? (
                          <div>
                            <span className="line-through text-brand-cream-muted text-sm mr-2">
                              ~${prices.base}
                            </span>
                            <span className="text-brand-gold font-bold text-xl">~${prices.promo}</span>
                          </div>
                        ) : (
                          <span className="text-brand-gold font-bold text-xl">~${prices.base}</span>
                        )}
                      </div>
                    </div>
                    {selectedService.promotion && (
                      <p className="text-brand-gold/70 text-xs mt-1">
                        🏷 {selectedService.promotion.name} appliquée
                      </p>
                    )}
                    <p className="text-brand-cream-muted/60 text-xs mt-1">{t('confirm.priceNote')}</p>
                  </div>
                );
              })()}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <p className="text-brand-cream-muted/60 text-xs mb-4">{t('confirm.terms')}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-brand-black-border">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← {tCommon('back')}
          </button>
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {tCommon('next')} →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-gold flex items-center gap-2 disabled:opacity-60"
            >
              {submitting && (
                <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
              )}
              {t('confirm.submit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
