import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { newEmail, currentPassword } = await req.json();

  if (!newEmail || !currentPassword) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return NextResponse.json({ error: 'Format de courriel invalide' }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { email: session.user?.email ?? '' } });
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: 'Mot de passe actuel incorrect', field: 'password' }, { status: 401 });

  // Check if email already taken by another account
  const existing = await prisma.adminUser.findUnique({ where: { email: newEmail } });
  if (existing && existing.id !== user.id) {
    return NextResponse.json({ error: 'Ce courriel est déjà utilisé' }, { status: 409 });
  }

  await prisma.adminUser.update({ where: { id: user.id }, data: { email: newEmail } });

  return NextResponse.json({ success: true });
}
