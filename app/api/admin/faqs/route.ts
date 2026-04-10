import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { questionFr, questionEn, answerFr, answerEn } = body;
  if (!questionFr || !answerFr) return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });

  const count = await prisma.fAQ.count();
  const faq = await prisma.fAQ.create({
    data: {
      questionFr,
      questionEn: questionEn ?? questionFr,
      answerFr,
      answerEn: answerEn ?? answerFr,
      order: count,
    },
  });
  return NextResponse.json(faq, { status: 201 });
}
