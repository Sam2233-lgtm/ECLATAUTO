import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { name, description, discountType, discountValue, startDate, endDate, active, serviceIds } = body;

  // Update junction table if serviceIds provided
  if (serviceIds !== undefined) {
    await prisma.promotionService.deleteMany({ where: { promotionId: params.id } });
    if (serviceIds.length > 0) {
      await prisma.promotionService.createMany({
        data: serviceIds.map((serviceId: string) => ({ promotionId: params.id, serviceId })),
      });
    }
  }

  const promotion = await prisma.promotion.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description: description || null }),
      ...(discountType !== undefined && { discountType }),
      ...(discountValue !== undefined && { discountValue: parseInt(discountValue) }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
      ...(active !== undefined && { active }),
    },
    include: { services: { include: { service: true } } },
  });

  return NextResponse.json(promotion);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  await prisma.promotion.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
