import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { LanguageProvider } from '@/lib/i18n';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WISAL - Video Shopping Platform',
  description: 'Discover products through engaging videos',
  manifest: '/manifest.json',
  themeColor: '#1E40AF',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WISAL',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <Providers>
            {children}
            <PWAInstallPrompt />
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
