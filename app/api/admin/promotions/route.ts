import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const promotions = await prisma.promotion.findMany({
    include: { services: { include: { service: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(promotions);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { name, description, discountType, discountValue, startDate, endDate, active, serviceIds } = body;

  if (!name || !discountType || !discountValue || !startDate || !endDate) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const promotion = await prisma.promotion.create({
    data: {
      name,
      description: description || null,
      discountType,
      discountValue: parseInt(discountValue),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      active: active !== false,
      services: {
        create: (serviceIds || []).map((serviceId: string) => ({ serviceId })),
      },
    },
    include: { services: { include: { service: true } } },
  });

  return NextResponse.json(promotion, { status: 201 });
}
