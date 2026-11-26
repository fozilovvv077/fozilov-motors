import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { isAdminRequest } from '@/lib/auth';
import { deleteCar, getCar, setCarStatus, updateCar } from '@/lib/db';
import { validateCar } from '@/lib/validate';
import type { CarStatus } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUSES: CarStatus[] = ['pending', 'approved', 'sold', 'rejected'];
type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const id = Number(params.id);
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  try {
    // Faqat holatni o'zgartirish
    if (body.status && Object.keys(body).length === 1) {
      if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Noto'g'ri holat" }, { status: 400 });
      const car = await setCarStatus(id, body.status);
      return car ? NextResponse.json({ car }) : NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    // To'liq tahrirlash
    const existing = await getCar(id, true);
    if (!existing) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    const { data, errors } = validateCar({ ...existing, ...body });
    if (Object.keys(errors).length) return NextResponse.json({ error: "Ma'lumotlarni tekshiring", errors }, { status: 422 });
    let car = await updateCar(id, data);
    if (body.status && STATUSES.includes(body.status) && body.status !== existing.status) {
      car = await setCarStatus(id, body.status);
    }
    return NextResponse.json({ car });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Saqlashda xato' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  try {
    const car = await deleteCar(Number(params.id));
    if (!car) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    if (car.images.length && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(car.images).catch((e) => console.error('Rasmlarni o\'chirishda xato:', e));
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "O'chirishda xato" }, { status: 500 });
  }
}
