import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Admin',
  description: "Interface d'administration pour le contenu du site vidéo"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
