import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tasks App',
  description: 'Demo de tasks con Next.js, auth y seguridad básica',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#0f172a', color: '#e2e8f0' }}>
        {children}
      </body>
    </html>
  );
}
