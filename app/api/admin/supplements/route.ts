import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const supplements = await prisma.supplement.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(supplements);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const { nameFr, nameEn, descriptionFr, descriptionEn, price, order } = body;
  if (!nameFr || !nameEn) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  const supp = await prisma.supplement.create({
    data: { nameFr, nameEn, descriptionFr: descriptionFr || '', descriptionEn: descriptionEn || '', price: parseFloat(price) || 0, order: order || 0, active: true },
  });
  return NextResponse.json(supp, { status: 201 });
}
