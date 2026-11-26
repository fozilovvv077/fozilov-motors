import { neon } from '@neondatabase/serverless';
import type { Car, CarInput, CarStatus } from './types';

type Sql = ReturnType<typeof neon>;
let _sql: Sql | null = null;
let _ready: Promise<unknown> | null = null;

function getSql(): Sql {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL topilmadi. Vercel'da Neon Postgres ulang.");
  if (!_sql) _sql = neon(url);
  return _sql;
}

/** Jadval birinchi so'rovda avtomatik yaratiladi — qo'lda migratsiya shart emas */
async function db(): Promise<Sql> {
  const sql = getSql();
  if (!_ready) {
    _ready = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS cars (
          id SERIAL PRIMARY KEY,
          brand TEXT NOT NULL,
          model TEXT NOT NULL,
          year INT NOT NULL,
          mileage INT NOT NULL DEFAULT 0,
          color TEXT NOT NULL DEFAULT '',
          fuel TEXT NOT NULL DEFAULT '',
          transmission TEXT NOT NULL DEFAULT '',
          engine TEXT NOT NULL DEFAULT '',
          condition TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          price BIGINT NOT NULL,
          currency TEXT NOT NULL DEFAULT 'USD',
          images JSONB NOT NULL DEFAULT '[]'::jsonb,
          seller_name TEXT NOT NULL,
          seller_phone TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
      await sql`CREATE INDEX IF NOT EXISTS cars_status_idx ON cars (status, created_at DESC)`;
    })().catch((e) => {
      _ready = null;
      throw e;
    });
  }
  await _ready;
  return sql;
}

function toCar(r: any): Car {
  let images: string[] = [];
  if (Array.isArray(r.images)) images = r.images;
  else if (typeof r.images === 'string') {
    try { images = JSON.parse(r.images); } catch { images = []; }
  }
  return {
    id: Number(r.id),
    brand: r.brand,
    model: r.model,
    year: Number(r.year),
    mileage: Number(r.mileage),
    color: r.color,
    fuel: r.fuel,
    transmission: r.transmission,
    engine: r.engine,
    condition: r.condition,
    description: r.description,
    price: Number(r.price),
    currency: r.currency === 'UZS' ? 'UZS' : 'USD',
    images,
    seller_name: r.seller_name,
    seller_phone: r.seller_phone,
    status: r.status as CarStatus,
    created_at: new Date(r.created_at).toISOString(),
  };
}

const rows = (r: unknown) => (Array.isArray(r) ? r : []) as any[];

export async function listPublicCars(): Promise<Car[]> {
  const sql = await db();
  const r = await sql`SELECT * FROM cars WHERE status IN ('approved','sold') ORDER BY (status = 'sold'), created_at DESC LIMIT 500`;
  return rows(r).map(toCar);
}

export async function listAllCars(): Promise<Car[]> {
  const sql = await db();
  const r = await sql`SELECT * FROM cars ORDER BY created_at DESC LIMIT 1000`;
  return rows(r).map(toCar);
}

export async function getCar(id: number, includeHidden = false): Promise<Car | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const sql = await db();
  const r = rows(await sql`SELECT * FROM cars WHERE id = ${id} LIMIT 1`);
  if (!r[0]) return null;
  const car = toCar(r[0]);
  if (!includeHidden && car.status !== 'approved' && car.status !== 'sold') return null;
  return car;
}

export async function createCar(c: CarInput, status: CarStatus = 'pending'): Promise<Car> {
  const sql = await db();
  const r = rows(await sql`
    INSERT INTO cars (brand, model, year, mileage, color, fuel, transmission, engine, condition,
      description, price, currency, images, seller_name, seller_phone, status)
    VALUES (${c.brand}, ${c.model}, ${c.year}, ${c.mileage}, ${c.color}, ${c.fuel}, ${c.transmission},
      ${c.engine}, ${c.condition}, ${c.description}, ${c.price}, ${c.currency},
      ${JSON.stringify(c.images)}::jsonb, ${c.seller_name}, ${c.seller_phone}, ${status})
    RETURNING *`);
  return toCar(r[0]);
}

export async function updateCar(id: number, c: CarInput): Promise<Car | null> {
  const sql = await db();
  const r = rows(await sql`
    UPDATE cars SET brand=${c.brand}, model=${c.model}, year=${c.year}, mileage=${c.mileage},
      color=${c.color}, fuel=${c.fuel}, transmission=${c.transmission}, engine=${c.engine},
      condition=${c.condition}, description=${c.description}, price=${c.price}, currency=${c.currency},
      images=${JSON.stringify(c.images)}::jsonb, seller_name=${c.seller_name}, seller_phone=${c.seller_phone}
    WHERE id = ${id} RETURNING *`);
  return r[0] ? toCar(r[0]) : null;
}

export async function setCarStatus(id: number, status: CarStatus): Promise<Car | null> {
  const sql = await db();
  const r = rows(await sql`UPDATE cars SET status = ${status} WHERE id = ${id} RETURNING *`);
  return r[0] ? toCar(r[0]) : null;
}

export async function deleteCar(id: number): Promise<Car | null> {
  const sql = await db();
  const r = rows(await sql`DELETE FROM cars WHERE id = ${id} RETURNING *`);
  return r[0] ? toCar(r[0]) : null;
}
