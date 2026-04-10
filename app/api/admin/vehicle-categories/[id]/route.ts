import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { nameFr, nameEn, order, active } = body;

  const category = await prisma.vehicleCategory.update({
    where: { id: params.id },
    data: {
      ...(nameFr !== undefined && { nameFr }),
      ...(nameEn !== undefined && { nameEn }),
      ...(order !== undefined && { order }),
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  await prisma.vehicleCategory.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
