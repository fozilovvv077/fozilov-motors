'use client';
import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '@/lib/format';

export default function CountUp({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value, duration]);
  return <span ref={ref}>{formatNumber(n)}</span>;
}
