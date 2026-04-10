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

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, Buffer.from(bytes), { contentType: file.type });

  if (uploadError) {
    console.error('Supabase Storage upload error:', uploadError);
    return NextResponse.json({ error: 'Erreur lors du téléversement' }, { status: 500 });
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
