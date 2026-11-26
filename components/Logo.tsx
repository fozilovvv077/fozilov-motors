'use client';
import { motion } from 'framer-motion';

export default function Logo({ pulse = 0, compact = false }: { pulse?: number; compact?: boolean }) {
  return (
    <motion.div className="group flex items-center gap-2.5" whileHover="hover" whileTap={{ scale: 0.94 }}>
      <motion.div
        key={pulse}
        initial={pulse ? { rotate: -20, scale: 0.7 } : false}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 14 }}
        variants={{ hover: { rotate: -8, scale: 1.06 } }}
        className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-accent shadow-lg shadow-accent/30 sm:h-11 sm:w-11"
      >
        <svg viewBox="0 0 64 64" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden>
          <path d="M20 46V18h24v6H27v6h14v6H27v10z" fill="#0b0b0d" />
        </svg>
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/40 animate-shine" />
      </motion.div>
      {!compact && (
        <div className="text-left leading-none">
          <div className="font-display text-[15px] font-extrabold tracking-tight sm:text-lg">FOZILOV</div>
          <motion.div
            variants={{ hover: { letterSpacing: '0.42em' } }}
            className="mt-0.5 text-[10px] font-bold tracking-[0.32em] text-accent sm:text-[11px]"
          >
            MOTORS
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
