export type ServiceId =
  | 'exterior-basic'
  | 'exterior-interior'
  | 'shampoo'
  | 'decontamination'
  | 'paint-protection';

export type VehicleType = 'compact' | 'sedan' | 'suv' | 'truck' | 'van';

export interface Service {
  id: ServiceId;
  basePrice: number;
  duration: number; // minutes
}

export const SERVICES: Service[] = [
  { id: 'exterior-basic', basePrice: 49, duration: 60 },
  { id: 'exterior-interior', basePrice: 89, duration: 120 },
  { id: 'shampoo', basePrice: 149, duration: 150 },
  { id: 'decontamination', basePrice: 199, duration: 180 },
  { id: 'paint-protection', basePrice: 299, duration: 240 },
];

export const VEHICLE_TYPES: VehicleType[] = [
  'compact',
  'sedan',
  'suv',
  'truck',
  'van',
];

// Vehicle size multipliers for pricing
export const VEHICLE_MULTIPLIERS: Record<VehicleType, number> = {
  compact: 1.0,
  sedan: 1.0,
  suv: 1.2,
  truck: 1.3,
  van: 1.4,
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

export function calculatePrice(serviceId: ServiceId, vehicleType: VehicleType): number {
  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) return 0;
  const multiplier = VEHICLE_MULTIPLIERS[vehicleType];
  return Math.round(service.basePrice * multiplier);
}

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
