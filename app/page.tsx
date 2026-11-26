import Hero from '@/components/Hero';
import CarBrowser from '@/components/CarBrowser';
import { listPublicCars } from '@/lib/db';
import type { Car } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let cars: Car[] = [];
  let dbError = false;
  try {
    cars = await listPublicCars();
  } catch (e) {
    console.error(e);
    dbError = true;
  }
  return (
    <>
      <Hero total={cars.filter((c) => c.status === 'approved').length} />
      <CarBrowser cars={cars} dbError={dbError} />
    </>
  );
}
