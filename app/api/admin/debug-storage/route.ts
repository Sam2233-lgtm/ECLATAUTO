import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabase, STORAGE_BUCKET } from '@/lib/supabase';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const results: Record<string, unknown> = {};

  // 1. Check env vars (mask secrets)
  results.env = {
    SUPABASE_URL: process.env.SUPABASE_URL
      ? process.env.SUPABASE_URL.slice(0, 30) + '...'
      : '❌ MANQUANT',
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY
      ? '✅ présent (longueur: ' + process.env.SUPABASE_SECRET_KEY.length + ')'
      : '❌ MANQUANT',
    STORAGE_BUCKET,
  };

  // 2. List buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    results.buckets = { error: bucketsError.message };
  } else {
    results.buckets = buckets?.map((b) => ({
      name: b.name,
      public: b.public,
    }));
    results.targetBucketFound = buckets?.some((b) => b.name === STORAGE_BUCKET);
    results.targetBucketPublic = buckets?.find((b) => b.name === STORAGE_BUCKET)?.public ?? false;
  }

  // 3. Try a tiny test upload
  const testContent = Buffer.from('test');
  const testPath = `_test/${Date.now()}.txt`;
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(testPath, testContent, { contentType: 'text/plain' });

  if (uploadError) {
    results.testUpload = { success: false, error: uploadError.message };
  } else {
    // Clean up
    await supabase.storage.from(STORAGE_BUCKET).remove([testPath]);
    results.testUpload = { success: true };
  }

  return NextResponse.json(results, { status: 200 });
}
