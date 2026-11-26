'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { haptic } from '@/lib/tg-client';

const NAV = [
  { href: '/', label: 'Avtomobillar' },
  { href: '/elon', label: "E'lon joylash" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const lastTap = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Logotipni 2 marta bosish (kompyuterda double-click, telefonda double-tap) → admin panel.
  // Bir marta bosish → bosh sahifa. Telegram ichida ham ishlaydi.
  function onLogo(e: React.MouseEvent) {
    e.preventDefault();
    const now = Date.now();
    if (now - lastTap.current < 380) {
      if (timer.current) clearTimeout(timer.current);
      lastTap.current = 0;
      setPulse((p) => p + 1);
      haptic('medium');
      router.push('/admin');
      return;
    }
    lastTap.current = now;
    timer.current = setTimeout(() => {
      if (pathname !== '/') router.push('/');
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 380);
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'border-b border-line/80 bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-3 sm:h-20">
        <button
          type="button"
          onClick={onLogo}
          aria-label="Fozilov Motors — bosh sahifa"
          className="select-none [touch-action:manipulation]"
        >
          <Logo pulse={pulse} />
        </button>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV.map((n) => {
            const active = n.href === '/' ? pathname === '/' || pathname.startsWith('/car') : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`relative rounded-full px-3 py-2 text-[13px] font-semibold transition-colors sm:px-4 sm:text-sm ${
                  active ? 'text-white' : 'text-muted hover:text-fg'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-accent shadow-lg shadow-accent/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {n.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </motion.header>
  );
}
