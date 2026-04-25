import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const blocked = await prisma.blockedDate.findMany({ orderBy: { date: 'asc' } });
    return NextResponse.json(blocked);
  } catch (err) {
    console.error('[public/blocked-dates] DB error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
