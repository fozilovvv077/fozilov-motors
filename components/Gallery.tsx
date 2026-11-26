'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

const variants = {
  enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0.4 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0.4 }),
};

export default function Gallery({ images, alt, grayscale }: { images: string[]; alt: string; grayscale?: boolean }) {
  const [[i, dir], setState] = useState<[number, number]>([0, 0]);
  const n = images.length;
  const go = (d: number) => setState(([p]) => [(p + d + n) % n, d]);
  const jump = (k: number) => setState(([p]) => [k, k > p ? 1 : -1]);

  if (!n) return <div className="card grid aspect-[4/3] place-items-center text-6xl">🚗</div>;

  return (
    <div>
      <div className="card relative aspect-[4/3] overflow-hidden bg-black">
        <AnimatePresence initial={false} custom={dir}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            key={i}
            src={images[i]}
            alt={`${alt} — ${i + 1}`}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: 'spring', stiffness: 300, damping: 32 }, opacity: { duration: 0.2 } }}
            drag={n > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, { offset, velocity }) => {
              if (offset.x < -70 || velocity.x < -500) go(1);
              else if (offset.x > 70 || velocity.x > 500) go(-1);
            }}
            className={`absolute inset-0 h-full w-full cursor-grab object-contain active:cursor-grabbing ${grayscale ? 'grayscale' : ''}`}
            draggable={false}
          />
        </AnimatePresence>

        {n > 1 && (
          <>
            {[-1, 1].map((d) => (
              <motion.button
                key={d}
                type="button"
                onClick={() => go(d)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={d < 0 ? 'Oldingi' : 'Keyingi'}
                className={`absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-xl text-white backdrop-blur ${d < 0 ? 'left-3' : 'right-3'}`}
              >
                {d < 0 ? '‹' : '›'}
              </motion.button>
            ))}
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {images.map((_, k) => (
                <motion.span key={k} animate={{ width: k === i ? 22 : 7, opacity: k === i ? 1 : 0.55 }} className="h-[7px] rounded-full bg-white" />
              ))}
            </div>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, k) => (
            <motion.button
              key={src + k}
              type="button"
              onClick={() => jump(k)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${k === i ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
