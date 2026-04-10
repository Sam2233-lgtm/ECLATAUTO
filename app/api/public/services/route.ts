import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const now = new Date();

  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: {
      promotions: {
        include: { promotion: true },
        where: {
          promotion: {
            active: true,
            startDate: { lte: now },
            endDate: { gte: now },
          },
        },
      },
    },
  });

  return NextResponse.json(services);
}
