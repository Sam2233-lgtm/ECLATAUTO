import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(testimonials);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { name, location, text, stars, photoUrl } = body;
  if (!name || !text) return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });

  const count = await prisma.testimonial.count();
  const testimonial = await prisma.testimonial.create({
    data: {
      name,
      location: location ?? '',
      text,
      stars: stars ?? 5,
      photoUrl: photoUrl ?? null,
      order: count,
    },
  });
  return NextResponse.json(testimonial, { status: 201 });
}
