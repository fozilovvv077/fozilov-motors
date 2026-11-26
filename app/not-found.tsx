import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center text-center">
      <div>
        <div className="font-display text-7xl font-extrabold text-accent">404</div>
        <h1 className="mt-3 font-display text-xl font-bold">Sahifa topilmadi</h1>
        <p className="mt-2 text-sm text-muted">Bu e&apos;lon o&apos;chirilgan yoki hali tasdiqlanmagan bo&apos;lishi mumkin.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white">
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
