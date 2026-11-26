'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Car } from '@/lib/types';
import { formatNumber, formatPrice } from '@/lib/format';

export default function CarCard({ car, index = 0 }: { car: Car; index?: number }) {
  const sold = car.status === 'sold';
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index % 6, 5) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link
        href={`/car/${car.id}`}
        className="card block overflow-hidden transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-accent/10"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-line/40">
          {car.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={car.images[0]}
              alt={`${car.brand} ${car.model}`}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${sold ? 'grayscale' : ''}`}
            />
          ) : (
            <div className="grid h-full place-items-center text-4xl">🚗</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          <div className="absolute left-3 top-3 flex gap-1.5">
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">{car.year}</span>
            {car.images.length > 1 && (
              <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">📷 {car.images.length}</span>
            )}
          </div>
          {sold && (
            <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-[11px] font-extrabold uppercase text-white">Sotildi</span>
          )}
          <div className="absolute bottom-3 left-3 right-3 font-display text-xl font-bold text-white drop-shadow">
            {formatPrice(car.price, car.currency)}
          </div>
        </div>
        <div className="p-4">
          <h3 className="truncate font-display text-base font-bold">
            {car.brand} {car.model}
          </h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="chip">🛣 {formatNumber(car.mileage)} km</span>
            <span className="chip">⛽ {car.fuel}</span>
            <span className="chip">⚙️ {car.transmission}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm font-semibold">
            <span className="text-muted">{car.condition}</span>
            <span className="inline-flex items-center gap-1 text-accent transition-transform duration-300 group-hover:translate-x-1">
              Batafsil →
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
