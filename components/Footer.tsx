'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Reveal from './Reveal';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <footer className="mt-24 border-t border-line">
      <div className="h-1 w-full road-line animate-road opacity-70" />
      <Reveal className="container-x flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <div>
          <div className="font-display text-lg font-extrabold">
            FOZILOV <span className="text-accent">MOTORS</span>
          </div>
          <p className="mt-1 text-sm text-muted">Avtomobil sotish va sotib olish — ishonchli va tez.</p>
        </div>
        <div className="flex gap-5 text-sm font-semibold text-muted">
          <Link href="/" className="transition-colors hover:text-accent">Avtomobillar</Link>
          <Link href="/elon" className="transition-colors hover:text-accent">E&apos;lon joylash</Link>
        </div>
        <p className="text-xs text-muted">© {new Date().getFullYear()} Fozilov Motors</p>
      </Reveal>
    </footer>
  );
}
