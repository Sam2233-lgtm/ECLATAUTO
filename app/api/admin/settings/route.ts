import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ALLOWED_FIELDS = [
  'instagramUrl', 'facebookUrl', 'phone', 'email', 'adminEmail',
  'heroBadge', 'heroTitle', 'heroTitleHighlight', 'heroSubtitle',
  'statClients', 'statYears', 'statRating',
  'businessHours', 'serviceZone', 'bookingEnabled', 'confirmationMessage',
];

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();

  // Only allow whitelisted fields
  const updateData: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: updateData,
    create: { id: 'singleton', ...updateData },
  });

  return NextResponse.json(settings);
}
