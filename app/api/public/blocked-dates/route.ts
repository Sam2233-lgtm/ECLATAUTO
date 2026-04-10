import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const blocked = await prisma.blockedDate.findMany({ orderBy: { date: 'asc' } });
  return NextResponse.json(blocked);
}
