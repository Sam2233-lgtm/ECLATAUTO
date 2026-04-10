import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

function createTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const vehicleType = formData.get('vehicleType') as string;
    const description = formData.get('description') as string;

    if (!firstName || !lastName || !email || !phone || !description) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    // Upload photos to Supabase Storage
    const photoUrls: string[] = [];
    const files = formData.getAll('photos') as File[];
    for (const file of files.slice(0, 3)) {
      if (file.size === 0) continue;
      const bytes = await file.arrayBuffer();
      const filename = `quotes/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
      const { error } = await supabase.storage.from('photos').upload(filename, Buffer.from(bytes), { contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from('photos').getPublicUrl(filename);
        photoUrls.push(data.publicUrl);
      }
    }

    // Create quote in DB
    const quote = await prisma.quote.create({
      data: { firstName, lastName, email, phone, vehicleType, description, photoUrls: photoUrls.length > 0 ? photoUrls : undefined, status: 'pending' },
    });

    // Send emails
    const transporter = createTransporter();
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
    const adminEmail = settings?.adminEmail || process.env.SMTP_USER || '';

    if (transporter) {
      const photosHtml = photoUrls.length > 0
        ? `<p><strong>Photos:</strong></p>${photoUrls.map(url => `<a href="${url}">${url}</a>`).join('<br>')}`
        : '';

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: 'samuel@eclatautomtl.com',
        subject: `🔔 Nouveau devis — ${firstName} ${lastName}`,
        html: `<h2>Nouvelle demande de devis</h2>
<p><strong>Client:</strong> ${firstName} ${lastName}</p>
<p><strong>Courriel:</strong> ${email}</p>
<p><strong>Téléphone:</strong> ${phone}</p>
<p><strong>Type de véhicule:</strong> ${vehicleType}</p>
<p><strong>Description:</strong></p>
<p>${description.replace(/\n/g, '<br>')}</p>
${photosHtml}`,
      }).catch(() => {});

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Éclat Auto — Demande de devis reçue',
        html: `<h2>Bonjour ${firstName},</h2>
<p>Nous avons bien reçu votre demande de devis.</p>
<p>Vous recevrez votre soumission dans les 24h.</p>
<p><strong>Votre demande :</strong></p>
<p>${description.replace(/\n/g, '<br>')}</p>
<p>Merci de nous faire confiance,<br>L'équipe Éclat Auto</p>`,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, id: quote.id });
  } catch (error) {
    console.error('Quote error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
