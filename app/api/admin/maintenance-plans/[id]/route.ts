import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { name, frequency, price, description, features, isActive, order } = body;

  const plan = await prisma.maintenancePlan.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(frequency !== undefined && { frequency }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(description !== undefined && { description }),
      ...(features !== undefined && { features }),
      ...(isActive !== undefined && { isActive }),
      ...(order !== undefined && { order }),
    },
  });
  return NextResponse.json(plan);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  await prisma.maintenancePlan.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
