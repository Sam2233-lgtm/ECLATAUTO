import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref')?.toUpperCase().trim();
  const email = searchParams.get('email')?.trim();

  if (!ref || !email) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  const reservation = await prisma.reservation.findFirst({
    where: {
      confirmationNumber: ref,
      email: { equals: email, mode: 'insensitive' },
    },
    select: {
      confirmationNumber: true,
      firstName: true,
      lastName: true,
      service: true,
      vehicleType: true,
      vehicleMake: true,
      vehicleModel: true,
      vehicleYear: true,
      vehicleColor: true,
      date: true,
      timeSlot: true,
      address: true,
      city: true,
      postalCode: true,
      status: true,
      price: true,
      notes: true,
      createdAt: true,
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
  }

  return NextResponse.json(reservation);
}
