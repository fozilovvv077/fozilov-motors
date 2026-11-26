'use client';
import { MotionConfig } from 'framer-motion';
import { useEffect } from 'react';
import { getTelegram } from '@/lib/tg-client';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Telegram Mini App ichida ochilganda: tayyorlik, to'liq ekran, ranglar
  useEffect(() => {
    const tg = getTelegram();
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      document.documentElement.classList.add('in-telegram');
      let stored: string | null = null;
      try { stored = localStorage.getItem('fm-theme'); } catch {}
      const apply = () => {
        if (!stored && tg.colorScheme) document.documentElement.classList.toggle('dark', tg.colorScheme === 'dark');
        const dark = document.documentElement.classList.contains('dark');
        const color = dark ? '#0b0b0d' : '#f6f4ef';
        tg.setHeaderColor?.(color);
        tg.setBackgroundColor?.(color);
      };
      apply();
      tg.onEvent?.('themeChanged', apply);
      return () => tg.offEvent?.('themeChanged', apply);
    } catch {}
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
