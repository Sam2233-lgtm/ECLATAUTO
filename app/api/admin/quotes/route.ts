import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const quotes = await prisma.quote.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(quotes);
}
