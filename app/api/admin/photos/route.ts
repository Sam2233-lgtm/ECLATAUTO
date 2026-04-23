import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const photos = await prisma.photo.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  // Expects JSON body: { url, filename, title?, type? }
  // The actual file upload is done directly browser → Supabase via a signed URL.
  const body = await req.json().catch(() => null);
  if (!body || !body.url) {
    return NextResponse.json({ error: 'url requis' }, { status: 400 });
  }

  const { url, filename = 'photo', title = null, type = 'result' } = body as {
    url: string;
    filename?: string;
    title?: string | null;
    type?: string;
  };

  const count = await prisma.photo.count();
  const photo = await prisma.photo.create({
    data: {
      filename,
      url,
      title: title || null,
      type,
      order: count,
    },
  });

  return NextResponse.json(photo, { status: 201 });
}
