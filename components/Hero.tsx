'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CountUp from './CountUp';

const words = ['Orzuyingizdagi', 'avtomobil —', 'bir', 'bosishda.'];

export default function Hero({ total }: { total: number }) {
  return (
    <section className="grain relative overflow-hidden">
      {/* Fon: suzuvchi nurlar */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-accent/25 blur-[110px] animate-float" />
        <div className="absolute -left-40 top-40 h-[360px] w-[360px] rounded-full bg-accent/10 blur-[100px] animate-float [animation-delay:-3s]" />
      </div>

      <div className="container-x relative pb-14 pt-10 sm:pb-20 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="chip mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Yangi e&apos;lonlar har kuni
        </motion.div>

        <h1 className="max-w-4xl font-display text-[34px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
              <motion.span
                className={`inline-block ${i === 3 ? 'text-accent' : ''}`}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.15 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-5 max-w-xl text-base text-muted sm:text-lg"
        >
          Fozilov Motors — avtomobil sotib olish va sotishning eng qulay yo&apos;li. Sotuvchi bilan to&apos;g&apos;ridan-to&apos;g&apos;ri bog&apos;laning,
          vositachilarsiz.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <motion.a
            href="#cars"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/30"
          >
            Avtomobillarni ko&apos;rish ↓
          </motion.a>
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link href="/elon" className="block rounded-xl border border-line bg-card px-6 py-3.5 text-sm font-bold">
              + E&apos;lon joylash
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6"
        >
          {[
            { v: total, l: "Faol e'lon" },
            { v: 24, l: 'Soat aloqa', suffix: '/7' },
            { v: 0, l: "Vositachi haqi", suffix: " so'm" },
          ].map((s, i) => (
            <div key={i}>
              <div className="font-display text-xl font-bold sm:text-3xl">
                <CountUp value={s.v} />
                {s.suffix}
              </div>
              <div className="mt-1 text-xs text-muted">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Harakatlanayotgan yo'l chizig'i */}
      <div className="relative h-1.5 w-full overflow-hidden bg-line/40">
        <div className="absolute inset-0 road-line animate-road" />
      </div>
    </section>
  );
}
