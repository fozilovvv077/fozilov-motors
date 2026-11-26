'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import RippleButton from './RippleButton';
import { formatPhone } from '@/lib/format';
import { getTelegram, haptic } from '@/lib/tg-client';

/**
 * "Sotib olish" — sotuvchiga qo'ng'iroq.
 * Telefonda darhol qo'ng'iroq oynasi ochiladi; kompyuterda raqam va nusxa olish tugmasi ko'rsatiladi.
 * Telegram ichida ham ishlaydi (raqam har doim ko'rinadi — ba'zi iOS Telegram versiyalari tel: ni bloklaydi).
 */
export default function BuyButton({ phone, name, disabled }: { phone: string; name: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function buy() {
    setOpen(true);
    haptic('medium');
    const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (mobile) {
      const tg = getTelegram();
      // Telegram ichida tashqi ilovani ochish uchun location orqali chaqiramiz
      try {
        window.location.href = `tel:${phone}`;
      } catch {
        tg?.showAlert?.(`Sotuvchi raqami: ${formatPhone(phone)}`);
      }
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      const t = document.createElement('textarea');
      t.value = phone;
      document.body.appendChild(t);
      t.select();
      try { document.execCommand('copy'); } catch {}
      t.remove();
    }
    setCopied(true);
    haptic('success');
    setTimeout(() => setCopied(false), 1800);
  }

  if (disabled) {
    return (
      <div className="w-full rounded-xl bg-line/60 py-4 text-center text-sm font-bold text-muted">Bu avtomobil sotilgan</div>
    );
  }

  return (
    <div>
      <RippleButton onClick={buy} className="w-full py-4 text-base">
        <motion.svg
          animate={{ rotate: [0, -14, 14, -10, 10, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 2.2 }}
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        >
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
        </motion.svg>
        Sotib olish — qo&apos;ng&apos;iroq qilish
      </RippleButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-accent/40 bg-accent/10 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted">Sotuvchi: {name}</div>
              <a href={`tel:${phone}`} className="mt-1 block font-display text-2xl font-bold text-accent">
                {formatPhone(phone)}
              </a>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href={`tel:${phone}`} className="rounded-lg bg-accent py-2.5 text-center text-sm font-bold text-white">
                  📞 Qo&apos;ng&apos;iroq
                </a>
                <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={copy} className="rounded-lg border border-line bg-card py-2.5 text-sm font-bold">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={String(copied)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="inline-block">
                      {copied ? '✓ Nusxa olindi' : '📋 Nusxa olish'}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
