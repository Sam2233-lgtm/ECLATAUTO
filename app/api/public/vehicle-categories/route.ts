import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.vehicleCategory.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error('[public/vehicle-categories] DB error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
