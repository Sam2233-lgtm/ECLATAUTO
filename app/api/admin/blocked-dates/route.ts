import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const blocked = await prisma.blockedDate.findMany({ orderBy: { date: 'asc' } });
  return NextResponse.json(blocked);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { date, timeSlot, reason } = body;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
  }

  const blocked = await prisma.blockedDate.create({
    data: { date, timeSlot: timeSlot ?? null, reason: reason ?? null },
  });
  return NextResponse.json(blocked, { status: 201 });
}
