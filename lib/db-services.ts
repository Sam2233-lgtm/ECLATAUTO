import { prisma } from './prisma';

export interface ActivePromotion {
  id: string;
  name: string;
  discountType: string;
  discountValue: number;
}

export interface DbService {
  id: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  includesFr: string;
  includesEn: string;
  basePrice: number;
  pricing: Record<string, number> | null;
  duration: number;
  active: boolean;
  order: number;
  iconName: string;
  promotion: ActivePromotion | null;
}

export async function getActiveServicesWithPromos(): Promise<DbService[]> {
  const now = new Date();
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: {
      promotions: {
        include: { promotion: true },
        where: {
          promotion: {
            active: true,
            startDate: { lte: now },
            endDate: { gte: now },
          },
        },
        take: 1,
      },
    },
  });

  return services.map((s) => ({
    id: s.id,
    nameFr: s.nameFr,
    nameEn: s.nameEn,
    descriptionFr: s.descriptionFr,
    descriptionEn: s.descriptionEn,
    includesFr: s.includesFr,
    includesEn: s.includesEn,
    basePrice: s.basePrice,
    pricing: s.pricing as Record<string, number> | null,
    duration: s.duration,
    active: s.active,
    order: s.order,
    iconName: s.iconName,
    promotion: s.promotions[0]?.promotion
      ? {
          id: s.promotions[0].promotion.id,
          name: s.promotions[0].promotion.name,
          discountType: s.promotions[0].promotion.discountType,
          discountValue: s.promotions[0].promotion.discountValue,
        }
      : null,
  }));
}

export function calcPromoPrice(basePrice: number, promo: ActivePromotion): number {
  if (promo.discountType === 'percentage') {
    return Math.round(basePrice * (1 - promo.discountValue / 100));
  }
  return Math.max(0, basePrice - promo.discountValue);
}

export async function getSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
}

export async function getActivePhotos() {
  return prisma.photo.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });
}

export async function getActiveTestimonials() {
  return prisma.testimonial.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });
}

export async function getActiveFAQs() {
  return prisma.fAQ.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });
}

export async function getBlockedDates() {
  return prisma.blockedDate.findMany({
    orderBy: { date: 'asc' },
  });
}

// Generate a human-readable confirmation number
export async function generateConfirmationNumber(): Promise<string> {
  const count = await prisma.reservation.count();
  const num = String(count + 1).padStart(6, '0');
  return `EA-${num}`;
}
