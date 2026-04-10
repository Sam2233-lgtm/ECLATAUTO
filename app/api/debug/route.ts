import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const count = await prisma.adminUser.count();
    const user = await prisma.adminUser.findFirst();

    let passwordMatch = false;
    if (user) {
      passwordMatch = await bcrypt.compare('Admin123!', user.password);
    }

    return NextResponse.json({
      ok: true,
      adminCount: count,
      passwordMatch,
      hashPreview: user?.password?.slice(0, 20),
    });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
