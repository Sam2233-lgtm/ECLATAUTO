import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { name, location, text, stars, photoUrl, active, order } = body;

  const updated = await prisma.testimonial.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(location !== undefined && { location }),
      ...(text !== undefined && { text }),
      ...(stars !== undefined && { stars }),
      ...(photoUrl !== undefined && { photoUrl }),
      ...(active !== undefined && { active }),
      ...(order !== undefined && { order }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  await prisma.testimonial.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
