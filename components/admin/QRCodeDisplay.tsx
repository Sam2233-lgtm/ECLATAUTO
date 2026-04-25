'use client';

import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, Copy, Check } from 'lucide-react';

interface QRCodeDisplayProps {
  locale: string;
}

export default function QRCodeDisplay({ locale }: QRCodeDisplayProps) {
  const isFr = locale === 'fr';
  const [copied, setCopied] = useState(false);

  // Build URL from window.location so it works in all environments
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const urlFr = `${origin}/fr/reservation`;
  const urlEn = `${origin}/en/reservation`;

  const canvasFrRef = useRef<HTMLDivElement>(null);
  const canvasEnRef = useRef<HTMLDivElement>(null);

  function downloadQR(ref: React.RefObject<HTMLDivElement | null>, filename: string) {
    const canvas = ref.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function print() {
    window.print();
  }

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qr-print-area, #qr-print-area * { visibility: visible; }
          #qr-print-area { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; gap: 80px; background: white; }
          .qr-print-card { display: flex; flex-direction: column; align-items: center; gap: 12px; }
          .qr-print-card canvas { width: 220px !important; height: 220px !important; }
          .qr-print-label { font-family: sans-serif; font-size: 14px; color: #111; text-align: center; }
          .qr-print-url { font-family: monospace; font-size: 10px; color: #555; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Action bar */}
      <div className="no-print flex flex-wrap items-center gap-3 mb-8">
        <button
          onClick={print}
          className="flex items-center gap-2 border border-brand-black-border px-4 py-2.5 text-sm text-brand-cream-muted hover:text-brand-cream hover:border-brand-gold/30 transition-colors"
        >
          <Printer className="w-4 h-4" />
          {isFr ? 'Imprimer les QR codes' : 'Print QR codes'}
        </button>
      </div>

      {/* QR codes grid */}
      <div id="qr-print-area" className="grid grid-cols-1 sm:grid-cols-2 gap-8">

        {/* Français */}
        <div className="qr-print-card border border-brand-black-border bg-brand-black-soft p-8 flex flex-col items-center gap-5">
          <div className="text-brand-cream-muted/40 text-[10px] uppercase tracking-[0.3em] font-sans no-print">
            Français
          </div>

          {/* White background for QR readability */}
          <div ref={canvasFrRef} className="bg-white p-4 inline-block">
            <QRCodeCanvas
              value={urlFr}
              size={220}
              bgColor="#ffffff"
              fgColor="#08090a"
              level="H"
            />
          </div>

          <div className="qr-print-label text-center">
            <p className="text-brand-cream font-sans font-semibold text-sm">Éclat Auto — Réservation</p>
            <p className="qr-print-url text-brand-cream-muted/50 text-xs mt-1 font-mono break-all">{urlFr}</p>
          </div>

          <div className="no-print flex gap-2 w-full">
            <button
              onClick={() => downloadQR(canvasFrRef, 'qr-eclatauto-fr.png')}
              className="flex-1 flex items-center justify-center gap-2 btn-gold py-2 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              {isFr ? 'Télécharger' : 'Download'} PNG
            </button>
            <button
              onClick={() => copyUrl(urlFr)}
              className="flex items-center gap-2 border border-brand-black-border px-3 py-2 text-xs text-brand-cream-muted hover:text-brand-cream transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-brand-gold" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* English */}
        <div className="qr-print-card border border-brand-black-border bg-brand-black-soft p-8 flex flex-col items-center gap-5">
          <div className="text-brand-cream-muted/40 text-[10px] uppercase tracking-[0.3em] font-sans no-print">
            English
          </div>

          <div ref={canvasEnRef} className="bg-white p-4 inline-block">
            <QRCodeCanvas
              value={urlEn}
              size={220}
              bgColor="#ffffff"
              fgColor="#08090a"
              level="H"
            />
          </div>

          <div className="qr-print-label text-center">
            <p className="text-brand-cream font-sans font-semibold text-sm">Éclat Auto — Book Now</p>
            <p className="qr-print-url text-brand-cream-muted/50 text-xs mt-1 font-mono break-all">{urlEn}</p>
          </div>

          <div className="no-print flex gap-2 w-full">
            <button
              onClick={() => downloadQR(canvasEnRef, 'qr-eclatauto-en.png')}
              className="flex-1 flex items-center justify-center gap-2 btn-gold py-2 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              {isFr ? 'Télécharger' : 'Download'} PNG
            </button>
            <button
              onClick={() => copyUrl(urlEn)}
              className="flex items-center gap-2 border border-brand-black-border px-3 py-2 text-xs text-brand-cream-muted hover:text-brand-cream transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-brand-gold" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Usage tip */}
      <p className="no-print mt-8 text-brand-cream-muted/40 text-xs font-sans">
        {isFr
          ? 'Le QR code amène directement à la page de réservation. Imprime-le sur tes cartes d\'affaires, dépliants ou autocollants.'
          : 'The QR code leads directly to the booking page. Print it on your business cards, flyers or stickers.'}
      </p>
    </div>
  );
}
