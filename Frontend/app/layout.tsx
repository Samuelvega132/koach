import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Koach - Karaoke Coach',
  description: 'Sistema de karaoke con feedback vocal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
