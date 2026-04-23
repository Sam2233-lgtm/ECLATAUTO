import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const cards = await prisma.serviceCard.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { name, description, imageUrl, prices, isActive, order } = body;

  if (!name || !description || !prices) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const card = await prisma.serviceCard.create({
    data: { name, description, imageUrl: imageUrl ?? null, prices, isActive: isActive ?? true, order: order ?? 0 },
  });
  return NextResponse.json(card, { status: 201 });
}
