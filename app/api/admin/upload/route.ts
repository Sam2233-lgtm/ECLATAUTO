import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
  }

  // Accept any image format (JPEG, PNG, WebP, HEIC, GIF, AVIF, etc.)
  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: `Type non supporté: ${file.type}. Envoyez une image.` },
      { status: 400 }
    );
  }

  // 15 MB max
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop lourd. Maximum 15 MB.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `services/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, Buffer.from(bytes), { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error('[upload/service-card] Supabase error:', uploadError.message);
    return NextResponse.json(
      { error: `Erreur Supabase: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
