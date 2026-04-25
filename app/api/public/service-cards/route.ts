import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cards = await prisma.serviceCard.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(cards);
  } catch (err) {
    console.error('[public/service-cards] DB error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
