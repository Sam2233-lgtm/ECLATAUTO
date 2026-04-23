import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateConfirmationNumber } from '@/lib/db-services';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const reservations = await prisma.reservation.findMany({
    where: status && status !== 'all' ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      clientName, clientPhone, clientEmail,
      service, vehicleType, date, timeSlot,
      price, source, notes,
    } = body;

    if (!clientName || !clientPhone || !service || !vehicleType || !date || !timeSlot) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    // Split name into first/last
    const nameParts = (clientName as string).trim().split(/\s+/);
    const firstName = nameParts[0] ?? clientName;
    const lastName = nameParts.slice(1).join(' ') || '—';

    const confirmationNumber = await generateConfirmationNumber();

    const reservation = await prisma.reservation.create({
      data: {
        confirmationNumber,
        service,
        vehicleType,
        date,
        timeSlot,
        firstName,
        lastName,
        email: clientEmail || '',
        phone: clientPhone,
        address: '',
        city: '',
        postalCode: '',
        notes: notes || '',
        price: price ? parseFloat(price) : 0,
        source: source || 'TÉLÉPHONE',
        status: 'confirmed',
        locale: 'fr',
      },
    });

    return NextResponse.json({ success: true, id: reservation.id, confirmationNumber }, { status: 201 });
  } catch (error) {
    console.error('[Admin reservation create error]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
