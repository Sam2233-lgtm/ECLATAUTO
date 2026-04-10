export type VehicleType = 'compact' | 'sedan' | 'suv' | 'truck' | 'van';

export const VEHICLE_TYPES: VehicleType[] = [
  'compact',
  'sedan',
  'suv',
  'truck',
  'van',
];

export const VEHICLE_TYPE_LABELS: Record<VehicleType, { fr: string; en: string }> = {
  compact: { fr: 'Compacte', en: 'Compact' },
  sedan:   { fr: 'Berline', en: 'Sedan' },
  suv:     { fr: 'VUS / Crossover', en: 'SUV / Crossover' },
  truck:   { fr: 'Camion', en: 'Truck' },
  van:     { fr: 'Fourgonnette / Minivan', en: 'Van / Minivan' },
};

export const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
];

export const RESERVATION_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export type VehiclePricing = Record<VehicleType, number>;

/** Returns the price for a given vehicle type using per-vehicle pricing if available */
export function getPriceForVehicle(
  basePrice: number,
  vehicleType: VehicleType,
  pricing?: Record<string, number> | null
): number {
  if (pricing && pricing[vehicleType] > 0) {
    return pricing[vehicleType];
  }
  // Legacy fallback using multipliers
  const multipliers: Record<VehicleType, number> = {
    compact: 1.0,
    sedan: 1.0,
    suv: 1.2,
    truck: 1.3,
    van: 1.4,
  };
  return Math.round(basePrice * multipliers[vehicleType]);
}
