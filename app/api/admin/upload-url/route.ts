import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';

/**
 * POST /api/admin/upload-url
 * Returns a Supabase signed upload URL so the browser can upload
 * directly to storage without going through a Netlify function (avoids the 6 MB body limit).
 *
 * Body: { filename: string, folder?: string }
 * Response: { signedUrl, path, publicUrl }
 */
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { filename, folder = 'general' } = await req.json() as { filename: string; folder?: string };

  if (!filename) {
    return NextResponse.json({ error: 'filename requis' }, { status: 400 });
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error('[upload-url] createSignedUploadUrl error:', error?.message);
    return NextResponse.json(
      { error: error?.message ?? 'Impossible de créer l\'URL signée' },
      { status: 500 }
    );
  }

  const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl });
}
