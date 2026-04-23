import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const plans = await prisma.maintenancePlan.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { name, frequency, price, description, features, isActive, order } = body;

  if (!name || !frequency || price === undefined || !description || !features) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const plan = await prisma.maintenancePlan.create({
    data: {
      name, frequency, price: parseFloat(price), description,
      features, isActive: isActive ?? true, order: order ?? 0,
    },
  });
  return NextResponse.json(plan, { status: 201 });
}
