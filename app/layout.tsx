import type {Metadata, Viewport} from 'next';
import {Providers} from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: '토스백신',
  description: '모바일 백신 앱 콘셉트 - Toss inspired NextUI experience',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F7F8FA',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
