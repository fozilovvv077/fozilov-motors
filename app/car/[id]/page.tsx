import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCar } from '@/lib/db';
import { formatDate, formatNumber, formatPrice } from '@/lib/format';
import Gallery from '@/components/Gallery';
import BuyButton from '@/components/BuyButton';
import Reveal from '@/components/Reveal';

export const dynamic = 'force-dynamic';

type Props = { params: { id: string } };

async function load(id: string) {
  try {
    return await getCar(Number(id));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await load(params.id);
  if (!car) return { title: 'Topilmadi' };
  const title = `${car.brand} ${car.model} ${car.year} — ${formatPrice(car.price, car.currency)}`;
  const description = `${formatNumber(car.mileage)} km, ${car.fuel}, ${car.transmission}, ${car.color}. ${car.description.slice(0, 120)}`;
  return {
    title,
    description,
    openGraph: { title, description, images: car.images[0] ? [{ url: car.images[0] }] : ['/og'] },
    twitter: { card: 'summary_large_image', title, description, images: car.images[0] ? [car.images[0]] : ['/og'] },
  };
}

export default async function CarPage({ params }: Props) {
  const car = await load(params.id);
  if (!car) notFound();
  const sold = car.status === 'sold';

  const specs = [
    ['Ishlab chiqarilgan yili', String(car.year)],
    ['Probeg', `${formatNumber(car.mileage)} km`],
    ["Yoqilg'i turi", car.fuel],
    ['Uzatmalar qutisi', car.transmission],
    ['Dvigatel hajmi', `${car.engine} L`],
    ['Rangi', car.color],
    ['Holati', car.condition],
    ["E'lon sanasi", formatDate(car.created_at)],
  ];

  return (
    <div className="container-x py-6 sm:py-10">
      <Reveal y={10}>
        <Link href="/" className="group mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-accent">
          <span className="transition-transform group-hover:-translate-x-1">←</span> Barcha avtomobillar
        </Link>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <Gallery images={car.images} alt={`${car.brand} ${car.model}`} grayscale={sold} />
        </Reveal>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal delay={0.1} className="card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="chip mb-3">#{car.id}</span>
                <h1 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                  {car.brand} {car.model}
                </h1>
                <p className="mt-1 text-sm text-muted">
                  {car.year} · {formatNumber(car.mileage)} km · {car.transmission}
                </p>
              </div>
              {sold && <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-extrabold uppercase text-white">Sotildi</span>}
            </div>

            <div className="my-6 font-display text-3xl font-extrabold text-accent sm:text-4xl">{formatPrice(car.price, car.currency)}</div>

            <BuyButton phone={car.seller_phone} name={car.seller_name} disabled={sold} />

            <div className="mt-5 flex items-center gap-3 border-t border-line pt-5">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 font-display font-bold text-accent">
                {car.seller_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs text-muted">Sotuvchi</div>
                <div className="font-bold">{car.seller_name}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Reveal>
            <h2 className="mb-4 font-display text-xl font-bold">Xususiyatlari</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {specs.map(([k, v], i) => (
              <Reveal key={k} delay={i * 0.05} y={16} className="card p-4 transition-colors hover:border-accent/50">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{k}</div>
                <div className="mt-1 font-bold">{v}</div>
              </Reveal>
            ))}
          </div>

          {car.description && (
            <Reveal className="mt-8">
              <h2 className="mb-3 font-display text-xl font-bold">Tavsif</h2>
              <p className="card whitespace-pre-line p-5 leading-relaxed text-fg/90">{car.description}</p>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
