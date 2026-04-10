import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RESERVATION_STATUSES } from '@/lib/constants';
import { sendStatusUpdateEmail } from '@/lib/email';
import { getSiteSettings } from '@/lib/db-services';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { status, internalNote } = body;

  // Validate status if provided
  if (status !== undefined && !RESERVATION_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (status !== undefined) updateData.status = status;
  if (internalNote !== undefined) updateData.internalNote = internalNote;

  const reservation = await prisma.reservation.update({
    where: { id: params.id },
    data: updateData,
  });

  // Send status update email if status changed
  if (status !== undefined && status !== 'pending') {
    try {
      const settings = await getSiteSettings();
      await sendStatusUpdateEmail(
        {
          firstName: reservation.firstName,
          lastName: reservation.lastName,
          email: reservation.email,
          confirmationNumber: reservation.confirmationNumber ?? reservation.id.slice(-8).toUpperCase(),
          service: reservation.service,
          date: reservation.date,
          timeSlot: reservation.timeSlot,
          locale: reservation.locale,
        },
        status,
        settings.adminEmail
      );
    } catch (err) {
      console.error('[Status email error]', err);
    }
  }

  return NextResponse.json(reservation);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  await prisma.reservation.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
