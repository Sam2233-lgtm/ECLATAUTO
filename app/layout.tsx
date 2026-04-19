import type { Metadata } from 'next';
import { DM_Sans, Bebas_Neue } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
  weight: '400',
});

export const metadata: Metadata = {
  title: {
    default: 'Éclat Auto — Détailing automobile à domicile',
    template: '%s | Éclat Auto',
  },
  description:
    'Service de détailing automobile professionnel à domicile au Québec. Lavage, shampooing, décontamination et protection peinture.',
  keywords: ['détailing automobile', 'lavage voiture', 'détailing mobile', 'Montréal', 'Québec'],
  authors: [{ name: 'Éclat Auto' }],
  creator: 'Éclat Auto',
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'https://eclatautoqc.netlify.app'),
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    alternateLocale: 'en_CA',
    siteName: 'Éclat Auto',
    title: 'Éclat Auto — Détailing automobile à domicile',
    description:
      'Service de détailing automobile professionnel à domicile au Québec.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${bebasNeue.variable}`}>
      <body>{children}</body>
    </html>
  );
}
