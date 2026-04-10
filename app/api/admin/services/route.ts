import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { nameFr, nameEn, descriptionFr, descriptionEn, includesFr, includesEn, basePrice, duration, active, order, iconName } = body;

  if (!nameFr || !nameEn || !basePrice || !duration) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      nameFr, nameEn,
      descriptionFr: descriptionFr || '',
      descriptionEn: descriptionEn || '',
      includesFr: includesFr || '',
      includesEn: includesEn || '',
      basePrice: parseInt(basePrice),
      duration: parseInt(duration),
      active: active !== false,
      order: order || 0,
      iconName: iconName || 'Sparkles',
    },
  });

  return NextResponse.json(service, { status: 201 });
}
