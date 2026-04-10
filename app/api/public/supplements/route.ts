import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export async function GET() {
  const supplements = await prisma.supplement.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
  return NextResponse.json(supplements);
}
