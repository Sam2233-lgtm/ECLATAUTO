import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const photos = await prisma.photo.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string | null;
  const type = (formData.get('type') as string) || 'result';

  if (!file) return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });

  // Accept any image format (JPEG, PNG, WebP, HEIC, GIF, AVIF, etc.)
  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: `Type non supporté: ${file.type}. Envoyez une image.` },
      { status: 400 }
    );
  }

  // 15 MB max
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 15 MB)' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, Buffer.from(bytes), { contentType: file.type });

  if (uploadError) {
    console.error('[photos] Supabase Storage error:', uploadError.message);
    return NextResponse.json({ error: `Erreur Supabase: ${uploadError.message}` }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);

  const count = await prisma.photo.count();
  const photo = await prisma.photo.create({
    data: {
      filename,
      url: publicUrl,
      title: title || null,
      type,
      order: count,
    },
  });

  return NextResponse.json(photo, { status: 201 });
}
