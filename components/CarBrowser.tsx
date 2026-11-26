'use client';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Car } from '@/lib/types';
import { FUELS, TRANSMISSIONS } from '@/lib/types';
import CarCard from './CarCard';
import Reveal from './Reveal';

type Sort = 'new' | 'cheap' | 'expensive' | 'year';
const INITIAL = { q: '', brand: '', fuel: '', transmission: '', currency: '', min: '', max: '', yearFrom: '', sort: 'new' as Sort };

export default function CarBrowser({ cars, dbError }: { cars: Car[]; dbError?: boolean }) {
  const [f, setF] = useState(INITIAL);
  const [open, setOpen] = useState(false);
  const set = (k: keyof typeof INITIAL, v: string) => setF((p) => ({ ...p, [k]: v }));

  const brands = useMemo(() => Array.from(new Set(cars.map((c) => c.brand))).sort(), [cars]);
  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 30 }, (_, i) => y - i);
  }, []);

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const min = Number(f.min.replace(/\D/g, '')) || 0;
    const max = Number(f.max.replace(/\D/g, '')) || Infinity;
    const yf = Number(f.yearFrom) || 0;
    const r = cars.filter(
      (c) =>
        (!q || `${c.brand} ${c.model} ${c.color} ${c.description}`.toLowerCase().includes(q)) &&
        (!f.brand || c.brand === f.brand) &&
        (!f.fuel || c.fuel === f.fuel) &&
        (!f.transmission || c.transmission === f.transmission) &&
        (!f.currency || c.currency === f.currency) &&
        c.price >= min &&
        c.price <= max &&
        c.year >= yf,
    );
    const sorted = [...r];
    if (f.sort === 'cheap') sorted.sort((a, b) => a.price - b.price);
    if (f.sort === 'expensive') sorted.sort((a, b) => b.price - a.price);
    if (f.sort === 'year') sorted.sort((a, b) => b.year - a.year);
    // sotilganlar har doim oxirida
    return sorted.sort((a, b) => Number(a.status === 'sold') - Number(b.status === 'sold'));
  }, [cars, f]);

  const activeCount = Object.entries(f).filter(([k, v]) => k !== 'sort' && k !== 'q' && v).length;

  return (
    <section id="cars" className="container-x scroll-mt-24 pt-12">
      <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold sm:text-4xl">Avtomobillar</h2>
          <p className="mt-1 text-sm text-muted">
            <motion.span key={list.length} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="inline-block font-bold text-fg">
              {list.length}
            </motion.span>{' '}
            ta e&apos;lon topildi
          </p>
        </div>
        <select className="field w-auto" value={f.sort} onChange={(e) => set('sort', e.target.value)} aria-label="Saralash">
          <option value="new">Eng yangi</option>
          <option value="cheap">Avval arzonlari</option>
          <option value="expensive">Avval qimmatlari</option>
          <option value="year">Yili bo&apos;yicha</option>
        </select>
      </Reveal>

      {/* Qidiruv */}
      <Reveal delay={0.05} className="card mb-8 p-3 sm:p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input className="field pl-11" placeholder="Marka, model yoki rang bo'yicha qidirish…" value={f.q} onChange={(e) => set('q', e.target.value)} />
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen((o) => !o)}
            className={`relative shrink-0 rounded-xl border px-4 text-sm font-bold transition-colors ${open ? 'border-accent bg-accent text-white' : 'border-line bg-bg'}`}
          >
            Filtrlar
            {activeCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] text-white ring-2 ring-card">{activeCount}</span>
            )}
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 pt-4 md:grid-cols-4">
                <div>
                  <label className="label">Marka</label>
                  <select className="field" value={f.brand} onChange={(e) => set('brand', e.target.value)}>
                    <option value="">Barchasi</option>
                    {brands.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Yoqilg&apos;i</label>
                  <select className="field" value={f.fuel} onChange={(e) => set('fuel', e.target.value)}>
                    <option value="">Barchasi</option>
                    {FUELS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Uzatmalar qutisi</label>
                  <select className="field" value={f.transmission} onChange={(e) => set('transmission', e.target.value)}>
                    <option value="">Barchasi</option>
                    {TRANSMISSIONS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Yili (dan)</label>
                  <select className="field" value={f.yearFrom} onChange={(e) => set('yearFrom', e.target.value)}>
                    <option value="">Istalgan</option>
                    {years.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Valyuta</label>
                  <select className="field" value={f.currency} onChange={(e) => set('currency', e.target.value)}>
                    <option value="">Barchasi</option>
                    <option value="USD">Dollar ($)</option>
                    <option value="UZS">So&apos;m</option>
                  </select>
                </div>
                <div>
                  <label className="label">Narx (dan)</label>
                  <input className="field" inputMode="numeric" placeholder="0" value={f.min} onChange={(e) => set('min', e.target.value)} />
                </div>
                <div>
                  <label className="label">Narx (gacha)</label>
                  <input className="field" inputMode="numeric" placeholder="∞" value={f.max} onChange={(e) => set('max', e.target.value)} />
                </div>
                <div className="flex items-end">
                  <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => setF(INITIAL)} className="w-full rounded-xl border border-line py-3 text-sm font-bold text-muted transition-colors hover:border-accent hover:text-accent">
                    Tozalash
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Reveal>

      {dbError && (
        <div className="card mb-8 border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Ma&apos;lumotlar bazasi hali ulanmagan. README faylidagi ko&apos;rsatmalar bo&apos;yicha Vercel&apos;da Neon Postgres ulang.
        </div>
      )}

      {list.length ? (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {list.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card grid place-items-center gap-3 px-6 py-16 text-center">
          <motion.div animate={{ x: [-30, 30, -30] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="text-5xl">
            🚗
          </motion.div>
          <h3 className="font-display text-lg font-bold">{cars.length ? 'Hech narsa topilmadi' : "Hozircha e'lonlar yo'q"}</h3>
          <p className="max-w-sm text-sm text-muted">
            {cars.length ? "Filtrlarni o'zgartirib ko'ring." : "Birinchi bo'lib avtomobilingizni sotuvga qo'ying!"}
          </p>
          {!cars.length && (
            <Link href="/elon" className="mt-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white">
              + E&apos;lon joylash
            </Link>
          )}
        </motion.div>
      )}
    </section>
  );
}
