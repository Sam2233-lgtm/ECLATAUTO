import { getActivePhotos } from '@/lib/db-services';

interface GalleryProps {
  locale: string;
}

export default async function Gallery({ locale }: GalleryProps) {
  const photos = await getActivePhotos();

  if (photos.length === 0) return null;

  const isFr = locale === 'fr';

  const resultPhotos = photos.filter((p) => p.type === 'result');
  const beforeAfterPhotos = photos.filter((p) => p.type === 'before' || p.type === 'after');

  return (
    <section id="gallery" className="py-24 px-4 bg-brand-black-soft">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-sm font-semibold uppercase tracking-widest">
            {isFr ? 'Nos réalisations' : 'Our work'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-cream mt-2">
            {isFr ? 'Galerie' : 'Gallery'}
          </h2>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto mt-4" />
          <p className="text-brand-cream-muted text-lg mt-4 max-w-2xl mx-auto">
            {isFr
              ? "Des résultats qui parlent d'eux-mêmes."
              : 'Results that speak for themselves.'}
          </p>
        </div>

        {/* Before / After section */}
        {beforeAfterPhotos.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-brand-black-border" />
              <h3 className="text-brand-cream font-semibold text-lg whitespace-nowrap">
                {isFr ? 'Avant / Après' : 'Before / After'}
              </h3>
              <div className="flex-1 h-px bg-brand-black-border" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {beforeAfterPhotos.map((photo) => {
                const isBefore = photo.type === 'before';
                return (
                  <div
                    key={photo.id}
                    className="relative group rounded-xl overflow-hidden border border-brand-black-border hover:border-brand-gold/30 transition-all duration-300"
                  >
                    <img
                      src={photo.url}
                      alt={
                        photo.title ||
                        (isFr
                          ? `${isBefore ? 'Avant' : 'Après'} — Éclat Auto`
                          : `${isBefore ? 'Before' : 'After'} — Éclat Auto`)
                      }
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Label overlay */}
                    <div
                      className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isBefore
                          ? 'bg-brand-black/80 text-brand-cream-muted border border-brand-black-border'
                          : 'bg-brand-gold/90 text-brand-black border border-brand-gold'
                      }`}
                    >
                      {isBefore
                        ? isFr
                          ? 'Avant'
                          : 'Before'
                        : isFr
                        ? 'Après'
                        : 'After'}
                    </div>
                    {/* Title on hover */}
                    {photo.title && (
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <span className="text-brand-cream text-xs">{photo.title}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results masonry grid */}
        {resultPhotos.length > 0 && (
          <>
            {beforeAfterPhotos.length > 0 && (
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-brand-black-border" />
                <h3 className="text-brand-cream font-semibold text-lg whitespace-nowrap">
                  {isFr ? 'Résultats' : 'Results'}
                </h3>
                <div className="flex-1 h-px bg-brand-black-border" />
              </div>
            )}
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {resultPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid group relative rounded-xl overflow-hidden border border-brand-black-border hover:border-brand-gold/30 transition-all duration-300"
                >
                  <img
                    src={photo.url}
                    alt={photo.title || (isFr ? 'Photo Éclat Auto' : 'Éclat Auto photo')}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {photo.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-xs rounded-full">
                          {isFr ? 'Résultat' : 'Result'}
                        </span>
                        <span className="text-brand-cream text-xs truncate">{photo.title}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
