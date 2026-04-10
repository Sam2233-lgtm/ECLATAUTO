import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const updated = await prisma.fAQ.update({
    where: { id: params.id },
    data: {
      ...(body.questionFr !== undefined && { questionFr: body.questionFr }),
      ...(body.questionEn !== undefined && { questionEn: body.questionEn }),
      ...(body.answerFr !== undefined && { answerFr: body.answerFr }),
      ...(body.answerEn !== undefined && { answerEn: body.answerEn }),
      ...(body.active !== undefined && { active: body.active }),
      ...(body.order !== undefined && { order: body.order }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  await prisma.fAQ.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
