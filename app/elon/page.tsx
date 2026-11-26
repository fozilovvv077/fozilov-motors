import type { Metadata } from 'next';
import ListingForm from '@/components/ListingForm';
import Reveal from '@/components/Reveal';

export const metadata: Metadata = {
  title: "E'lon joylash",
  description: "Avtomobilingizni Fozilov Motors'da soting — rasm, ma'lumot va narxni kiriting.",
};

export default function ElonPage() {
  return (
    <div className="container-x max-w-3xl py-8 sm:py-12">
      <Reveal y={12} className="mb-8">
        <span className="chip mb-3">Bepul</span>
        <h1 className="font-display text-3xl font-extrabold sm:text-5xl">
          Avtomobilingizni <span className="text-accent">soting</span>
        </h1>
        <p className="mt-2 text-muted">Ma&apos;lumotlarni to&apos;ldiring — xaridorlar sizga to&apos;g&apos;ridan-to&apos;g&apos;ri qo&apos;ng&apos;iroq qilishadi.</p>
      </Reveal>
      <ListingForm />
    </div>
  );
}
