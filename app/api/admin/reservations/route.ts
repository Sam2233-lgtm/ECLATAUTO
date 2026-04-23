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

    if (!clientName || !service || !vehicleType || !date || !timeSlot) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    // Split name into first/last
    const nameParts = String(clientName).trim().split(/\s+/);
    const firstName = nameParts[0] ?? String(clientName);
    const lastName = nameParts.slice(1).join(' ') || '—';

    const confirmationNumber = await generateConfirmationNumber();

    const reservation = await prisma.reservation.create({
      data: {
        confirmationNumber,
        service:      String(service),
        vehicleType:  String(vehicleType),
        vehicleMake:  '',
        vehicleModel: '',
        vehicleYear:  '',
        vehicleColor: '',
        date:         String(date),
        timeSlot:     String(timeSlot),
        firstName,
        lastName,
        email:        clientEmail  ? String(clientEmail)  : '',
        phone:        clientPhone  ? String(clientPhone)  : '',
        address:      '',
        city:         '',
        postalCode:   '',
        notes:        notes        ? String(notes)        : '',
        price:        price ? parseFloat(String(price)) : 0,
        source:       source       ? String(source)       : 'TELEPHONE',
        status:       'confirmed',
        locale:       'fr',
      },
    });

    return NextResponse.json({ success: true, id: reservation.id, confirmationNumber }, { status: 201 });
  } catch (error) {
    // Log the full error so we can debug on Netlify
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Admin reservation create error]', msg);
    return NextResponse.json({ error: 'Erreur serveur', detail: msg }, { status: 500 });
  }
}
