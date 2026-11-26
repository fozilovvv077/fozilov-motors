'use client';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import CarFields from './CarFields';
import ImageUploader, { type UploadItem } from './ImageUploader';
import RippleButton from './RippleButton';
import { EMPTY_CAR, type CarInput } from '@/lib/types';
import { validateCar } from '@/lib/validate';
import { haptic } from '@/lib/tg-client';

export default function ListingForm() {
  const [car, setCar] = useState<CarInput>(EMPTY_CAR);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [doneId, setDoneId] = useState<number | null>(null);

  const onChange = <K extends keyof CarInput>(k: K, v: CarInput[K]) => {
    setCar((p) => ({ ...p, [k]: v }));
    if (errors[k as string]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    if (items.some((i) => i.status === 'uploading')) {
      setServerError('Rasmlar yuklanishini kuting…');
      return;
    }
    const images = items.filter((i) => i.status === 'done' && i.url).map((i) => i.url as string);
    const { errors: errs } = validateCar({ ...car, images });
    const clean = Object.fromEntries(Object.entries(errs).filter(([, v]) => v));
    setErrors(clean);
    if (Object.keys(clean).length) {
      haptic('error');
      document.querySelector('.field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...car, images }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.error || 'Xatolik yuz berdi');
      }
      haptic('success');
      setDoneId(json.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      haptic('error');
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setCar(EMPTY_CAR);
    setItems([]);
    setErrors({});
    setDoneId(null);
  }

  return (
    <AnimatePresence mode="wait">
      {doneId ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="card mx-auto max-w-lg p-8 text-center"
        >
          <motion.svg viewBox="0 0 52 52" className="mx-auto h-24 w-24">
            <motion.circle cx="26" cy="26" r="24" fill="none" stroke="rgb(var(--accent))" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
            <motion.path d="M15 27l7 7 15-16" fill="none" stroke="rgb(var(--accent))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.4 }} />
          </motion.svg>
          <h2 className="mt-5 font-display text-2xl font-extrabold">E&apos;lon yuborildi!</h2>
          <p className="mt-2 text-sm text-muted">
            E&apos;loningiz (#{doneId}) admin tomonidan tekshirilgandan so&apos;ng saytda ko&apos;rinadi. Odatda bu ko&apos;p vaqt olmaydi.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded-xl border border-line px-5 py-3 text-sm font-bold">Bosh sahifa</Link>
            <RippleButton onClick={reset}>Yana e&apos;lon joylash</RippleButton>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -20 }} className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5 sm:p-7">
            <h2 className="mb-1 font-display text-lg font-bold">1. Rasmlar</h2>
            <p className="mb-4 text-sm text-muted">Sifatli rasmlar mashinani tezroq sotishga yordam beradi. Tartibini sudrab o&apos;zgartirish mumkin.</p>
            <ImageUploader items={items} setItems={setItems} error={errors.images} />
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5 sm:p-7">
            <h2 className="mb-4 font-display text-lg font-bold">2. Avtomobil ma&apos;lumotlari va aloqa</h2>
            <CarFields value={car} errors={errors} onChange={onChange} />
          </motion.section>

          <AnimatePresence>
            {serverError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold text-red-500">
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          <RippleButton type="submit" disabled={loading} className="w-full py-4 text-base">
            {loading ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white" />
                Yuborilmoqda…
              </>
            ) : (
              "E'lonni joylash →"
            )}
          </RippleButton>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
