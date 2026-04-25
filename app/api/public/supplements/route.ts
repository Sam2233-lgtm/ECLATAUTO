import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supplements = await prisma.supplement.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
    return NextResponse.json(supplements);
  } catch (err) {
    console.error('[public/supplements] DB error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
