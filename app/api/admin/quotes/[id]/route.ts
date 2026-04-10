import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

function createTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const quote = await prisma.quote.findUnique({ where: { id: params.id } });
  if (!quote) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const { status, adminNote, quoteAmount, quoteDetails, sendQuote } = body;

  let token: string | undefined;

  if (sendQuote && quoteAmount && quoteDetails) {
    // Generate accept token
    token = randomBytes(32).toString('hex');
    const quote = await prisma.quote.findUnique({ where: { id: params.id } });
    if (quote) {
      const transporter = createTransporter();
      if (transporter) {
        const acceptUrl = `${process.env.NEXTAUTH_URL}/api/quotes/accept?token=${token}`;
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: quote.email,
          subject: 'Éclat Auto — Votre soumission est prête',
          html: `<h2>Bonjour ${quote.firstName},</h2>
<p>Voici votre soumission pour votre demande de service :</p>
<h3>Montant : ${quoteAmount}$</h3>
<p>${quoteDetails.replace(/\n/g, '<br>')}</p>
<p>Pour accepter cette soumission, cliquez sur le bouton ci-dessous :</p>
<p><a href="${acceptUrl}" style="background:#C9A84C;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">✅ J'accepte la soumission</a></p>
<p>Ce lien est valide pour 30 jours.</p>
<p>L'équipe Éclat Auto</p>`,
        }).catch(() => {});
      }
    }
  }

  const updated = await prisma.quote.update({
    where: { id: params.id },
    data: {
      ...(status !== undefined && { status }),
      ...(adminNote !== undefined && { adminNote }),
      ...(quoteAmount !== undefined && { quoteAmount: parseFloat(quoteAmount) }),
      ...(quoteDetails !== undefined && { quoteDetails }),
      ...(token && { token, status: 'sent' }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  await prisma.quote.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
