import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
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
    <html lang="fr" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
