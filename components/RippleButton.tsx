'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { haptic } from '@/lib/tg-client';

type Props = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
  title?: string;
};

const styles = {
  primary: 'bg-accent text-white shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40',
  ghost: 'border border-line bg-card text-fg hover:border-accent/60',
  danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  success: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20',
};

/** Hover, bosish va "to'lqin" (ripple) animatsiyali tugma */
export default function RippleButton({ children, onClick, type = 'button', variant = 'primary', disabled, className = '', title }: Props) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; s: number }[]>([]);

  function handle(e: React.MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const s = Math.max(r.width, r.height) * 2;
    const id = Date.now() + Math.random();
    setRipples((p) => [...p, { id, x: e.clientX - r.left - s / 2, y: e.clientY - r.top - s / 2, s }]);
    setTimeout(() => setRipples((p) => p.filter((x) => x.id !== id)), 650);
    haptic('light');
    onClick?.(e);
  }

  return (
    <motion.button
      type={type}
      title={title}
      disabled={disabled}
      onClick={handle}
      whileHover={disabled ? undefined : { scale: 1.03, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3 text-sm font-bold transition-[box-shadow,background-color,border-color] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ scale: 0, opacity: 0.45 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="pointer-events-none absolute rounded-full bg-white"
            style={{ left: r.x, top: r.y, width: r.s, height: r.s }}
          />
        ))}
      </AnimatePresence>
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
