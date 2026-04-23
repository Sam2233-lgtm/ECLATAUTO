/**
 * Uploads a file directly from the browser to Supabase Storage
 * using a signed URL generated server-side.
 *
 * Flow: browser → /api/admin/upload-url (tiny JSON) → Supabase (direct PUT)
 * This bypasses Netlify's 6 MB function body limit entirely.
 */
export async function uploadImageDirect(
  file: File,
  folder: 'services' | 'gallery' | 'general' = 'general'
): Promise<string> {
  // 1. Get signed upload URL from server (small request — just metadata)
  const urlRes = await fetch('/api/admin/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, folder }),
  });

  if (!urlRes.ok) {
    const err = await urlRes.json().catch(() => ({}));
    throw new Error(err.error ?? `Erreur serveur (${urlRes.status})`);
  }

  const { signedUrl, publicUrl } = await urlRes.json() as {
    signedUrl: string;
    path: string;
    publicUrl: string;
  };

  // 2. Upload file directly to Supabase (bypasses Netlify entirely)
  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => '');
    throw new Error(`Erreur Supabase (${uploadRes.status}): ${text.slice(0, 120)}`);
  }

  return publicUrl;
}
