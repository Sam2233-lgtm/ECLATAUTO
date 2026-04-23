import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 300;

export async function GET() {
  const cards = await prisma.serviceCard.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(cards);
}
