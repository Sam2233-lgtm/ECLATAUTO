import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = await prisma.maintenancePlan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(plans);
  } catch (err) {
    console.error('[public/maintenance-plans] DB error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
