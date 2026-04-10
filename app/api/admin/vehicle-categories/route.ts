import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const categories = await prisma.vehicleCategory.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { nameFr, nameEn, order } = body;

  if (!nameFr || !nameEn) {
    return NextResponse.json({ error: 'Nom FR et EN requis' }, { status: 400 });
  }

  const category = await prisma.vehicleCategory.create({
    data: { nameFr, nameEn, order: order ?? 0, active: true },
  });

  return NextResponse.json(category, { status: 201 });
}
