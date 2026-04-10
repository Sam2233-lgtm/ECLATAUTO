import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email';
import { getSiteSettings, generateConfirmationNumber } from '@/lib/db-services';

const ReservationSchema = z.object({
  service: z.string().min(1),
  vehicleType: z.string().min(1),
  vehicleMake: z.string().max(50).optional().default(''),
  vehicleModel: z.string().max(50).optional().default(''),
  vehicleYear: z.string().max(4).optional().default(''),
  vehicleColor: z.string().max(50).optional().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  postalCode: z.string().min(6).max(10),
  notes: z.string().max(500).optional().default(''),
  price: z.number().int().min(0).optional().default(0),
  locale: z.enum(['fr', 'en']).optional().default('fr'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = ReservationSchema.parse(body);

    // Check if booking is enabled
    const settings = await getSiteSettings();
    if (!settings.bookingEnabled) {
      return NextResponse.json(
        { success: false, error: 'Les réservations en ligne sont temporairement désactivées.' },
        { status: 503 }
      );
    }

    // Check blocked dates
    const [blockedFull, blockedSlot] = await Promise.all([
      prisma.blockedDate.findFirst({ where: { date: data.date, timeSlot: null } }),
      prisma.blockedDate.findFirst({ where: { date: data.date, timeSlot: data.timeSlot } }),
    ]);

    if (blockedFull || blockedSlot) {
      return NextResponse.json(
        { success: false, error: 'Ce créneau n\'est plus disponible. Veuillez choisir une autre date ou heure.' },
        { status: 409 }
      );
    }

    const confirmationNumber = await generateConfirmationNumber();

    const reservation = await prisma.reservation.create({
      data: {
        ...data,
        confirmationNumber,
      },
    });

    // Send emails (non-blocking — don't fail reservation if email fails)
    const serviceName = data.service; // We'll use the ID; the email will show it as-is
    const emailData = {
      confirmationNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      service: serviceName,
      vehicleType: data.vehicleType,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vehicleYear: data.vehicleYear,
      vehicleColor: data.vehicleColor,
      date: data.date,
      timeSlot: data.timeSlot,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      notes: data.notes,
      price: data.price,
      locale: data.locale,
    };

    Promise.all([
      sendConfirmationEmail(emailData, settings.adminEmail, settings.confirmationMessage),
      sendAdminNotificationEmail(emailData, settings.adminEmail),
    ]).catch((err) => console.error('[Email error]', err));

    return NextResponse.json({ success: true, id: reservation.id, confirmationNumber }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Reservation creation error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}
