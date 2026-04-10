import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect(new URL('/', req.url));

  const quote = await prisma.quote.findUnique({ where: { token } });
  if (!quote) {
    return new NextResponse('<html><body><h1>Lien invalide ou expiré.</h1></body></html>', { headers: { 'Content-Type': 'text/html' } });
  }

  if (quote.status !== 'accepted') {
    await prisma.quote.update({ where: { token }, data: { status: 'accepted' } });
  }

  return new NextResponse(`<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Éclat Auto — Soumission acceptée</title>
<style>body{font-family:sans-serif;background:#0a0a0a;color:#f5f0e8;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}
.box{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:40px;text-align:center;max-width:500px}
h1{color:#C9A84C;margin-bottom:16px}p{color:#a0978a;line-height:1.6}
.check{font-size:64px;margin-bottom:24px}</style></head>
<body><div class="box"><div class="check">✅</div>
<h1>Soumission acceptée !</h1>
<p>Merci ${quote.firstName} ! Nous avons bien reçu votre acceptation.</p>
<p>Notre équipe vous contactera très bientôt pour confirmer les détails de votre rendez-vous.</p>
<p style="margin-top:24px"><a href="https://eclatautoqc.netlify.app" style="color:#C9A84C">Retour au site →</a></p>
</div></body></html>`, { headers: { 'Content-Type': 'text/html' } });
}
