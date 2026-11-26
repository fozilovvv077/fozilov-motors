import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Manrope, Unbounded } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { siteUrl } from '@/lib/site';

const display = Unbounded({ subsets: ['latin', 'cyrillic'], weight: ['500', '700', '800'], variable: '--font-display' });
const body = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-body' });

const description =
  "Fozilov Motors — O'zbekistonda avtomobil sotish va sotib olish. Minglab e'lonlar, qulay qidiruv va sotuvchi bilan to'g'ridan-to'g'ri aloqa.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'Fozilov Motors — avtomobil savdosi', template: '%s · Fozilov Motors' },
  description,
  applicationName: 'Fozilov Motors',
  keywords: ['avtomobil', 'mashina sotish', 'mashina sotib olish', 'avto bozor', 'Fozilov Motors', 'Toshkent'],
  openGraph: {
    type: 'website',
    siteName: 'Fozilov Motors',
    title: 'Fozilov Motors — avtomobil savdosi',
    description,
    locale: 'uz_UZ',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Fozilov Motors' }],
  },
  twitter: { card: 'summary_large_image', title: 'Fozilov Motors', description, images: ['/og'] },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0d' },
    { media: '(prefers-color-scheme: light)', color: '#f6f4ef' },
  ],
};

// Sahifa yuklanishidan oldin mavzuni qo'yish (miltillash bo'lmasligi uchun)
const themeScript = `(function(){try{var t=localStorage.getItem('fm-theme');var w=window.Telegram&&window.Telegram.WebApp;var d=t?t==='dark':(w&&w.colorScheme?w.colorScheme==='dark':true);document.documentElement.classList.toggle('dark',d)}catch(e){document.documentElement.classList.add('dark')}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${display.variable} ${body.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <Providers>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
