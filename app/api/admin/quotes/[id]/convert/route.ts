import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const quote = await prisma.quote.findUnique({ where: { id: params.id } });
  if (!quote) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });

  // Count for confirmation number
  const count = await prisma.reservation.count();
  const confirmationNumber = `EA-${String(count + 1).padStart(6, '0')}`;

  const reservation = await prisma.reservation.create({
    data: {
      confirmationNumber,
      service: 'devis',
      vehicleType: quote.vehicleType,
      firstName: quote.firstName,
      lastName: quote.lastName,
      email: quote.email,
      phone: quote.phone,
      address: '',
      city: '',
      postalCode: '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '09:00',
      notes: quote.description,
      price: quote.quoteAmount || 0,
      status: 'pending',
      locale: 'fr',
    },
  });

  await prisma.quote.update({ where: { id: params.id }, data: { status: 'accepted' } });

  return NextResponse.json({ success: true, reservationId: reservation.id });
}
