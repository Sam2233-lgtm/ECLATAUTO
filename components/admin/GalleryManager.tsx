'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, ImagePlus, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { uploadImageDirect } from '@/lib/upload-client';

interface Photo {
  id: string; filename: string; url: string;
  title: string | null; type: string; order: number; active: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  result: 'Résultat', before: 'Avant', after: 'Après',
};

export default function GalleryManager({ initialPhotos }: { initialPhotos: Photo[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', type: 'result' });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPendingFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    setError('');
  }

  function clearPending() {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPendingFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleUpload() {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    setError('');
    const newPhotos: Photo[] = [];

    for (const file of pendingFiles) {
      try {
        // 1. Upload directly browser → Supabase (bypasses Netlify 6 MB limit)
        const publicUrl = await uploadImageDirect(file, 'gallery');

        // 2. Create DB record (tiny JSON request — no file)
        const res = await fetch('/api/admin/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: publicUrl,
            filename: file.name,
            title: uploadForm.title,
            type: uploadForm.type,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setError(err.error || 'Erreur lors de la création de la photo');
          continue;
        }

        const photo = await res.json();
        newPhotos.push(photo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    clearPending();
    setUploading(false);
    router.refresh();
  }

  async function handleDelete(photo: Photo) {
    if (!confirm(`Supprimer cette photo?`)) return;
    await fetch(`/api/admin/photos/${photo.id}`, { method: 'DELETE' });
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    router.refresh();
  }

  async function toggleActive(photo: Photo) {
    const res = await fetch(`/api/admin/photos/${photo.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !photo.active }),
    });
    const updated = await res.json();
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? updated : p)));
  }

  return (
    <div className="space-y-8">
      {/* Upload section */}
      <div className="card-dark p-6">
        <h2 className="text-lg font-semibold text-brand-cream mb-4 flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-brand-gold" /> Ajouter des photos
        </h2>

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}

        {/* Drop zone */}
        {pendingFiles.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-brand-black-border rounded-xl p-10 text-center cursor-pointer hover:border-brand-gold/40 hover:bg-brand-gold/5 transition-all"
          >
            <Upload className="w-10 h-10 text-brand-cream-muted/40 mx-auto mb-3" />
            <p className="text-brand-cream-muted">Cliquez ou glissez des images ici</p>
            <p className="text-brand-cream-muted/50 text-xs mt-1">JPG, PNG, WebP — max 10 MB chacune</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap gap-3 mb-4">
              {previewUrls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-brand-black-border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-brand-cream-muted text-sm mb-4">{pendingFiles.length} photo{pendingFiles.length > 1 ? 's' : ''} sélectionnée{pendingFiles.length > 1 ? 's' : ''}</p>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

        {pendingFiles.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Titre (optionnel)</label>
              <input className="input-dark" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder="Résultat après décontamination" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-cream-muted mb-1.5">Type</label>
              <select className="input-dark" value={uploadForm.type} onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}>
                <option value="result">Résultat final</option>
                <option value="before">Avant</option>
                <option value="after">Après</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={handleUpload} disabled={uploading} className="btn-gold flex items-center gap-2 disabled:opacity-60">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Upload en cours...' : 'Uploader'}
              </button>
              <button onClick={clearPending} className="btn-ghost flex items-center gap-2">
                <X className="w-4 h-4" /> Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photos grid */}
      <div>
        <h2 className="text-lg font-semibold text-brand-cream mb-4">
          Photos ({photos.length})
        </h2>
        {photos.length === 0 ? (
          <div className="card-dark p-10 text-center text-brand-cream-muted">
            Aucune photo. Uploadez des images pour les afficher sur le site.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className={`group relative rounded-xl overflow-hidden border border-brand-black-border transition-all hover:border-brand-gold/30 ${!photo.active ? 'opacity-40' : ''}`}>
                <div className="aspect-square bg-brand-black-card">
                  <img src={photo.url} alt={photo.title || ''} className="w-full h-full object-cover" loading="lazy" />
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-brand-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button onClick={() => toggleActive(photo)}
                    className="px-3 py-1 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold rounded-lg text-xs font-medium hover:bg-brand-gold/30 transition-colors">
                    {photo.active ? 'Masquer' : 'Afficher'}
                  </button>
                  <button onClick={() => handleDelete(photo)}
                    className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Badge */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 bg-brand-black/80 text-brand-cream-muted text-xs rounded-full border border-brand-black-border">
                    {TYPE_LABELS[photo.type] || photo.type}
                  </span>
                </div>
                {photo.title && (
                  <div className="px-2 py-1.5 bg-brand-black-card border-t border-brand-black-border">
                    <p className="text-brand-cream text-xs truncate">{photo.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
