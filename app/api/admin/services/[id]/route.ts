import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { nameFr, nameEn, descriptionFr, descriptionEn, includesFr, includesEn, basePrice, duration, active, order, iconName } = body;

  const service = await prisma.service.update({
    where: { id: params.id },
    data: {
      ...(nameFr !== undefined && { nameFr }),
      ...(nameEn !== undefined && { nameEn }),
      ...(descriptionFr !== undefined && { descriptionFr }),
      ...(descriptionEn !== undefined && { descriptionEn }),
      ...(includesFr !== undefined && { includesFr }),
      ...(includesEn !== undefined && { includesEn }),
      ...(basePrice !== undefined && { basePrice: parseInt(basePrice) }),
      ...(duration !== undefined && { duration: parseInt(duration) }),
      ...(active !== undefined && { active }),
      ...(order !== undefined && { order }),
      ...(iconName !== undefined && { iconName }),
    },
  });

  return NextResponse.json(service);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  await prisma.service.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
