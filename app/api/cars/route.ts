import { NextRequest, NextResponse } from 'next/server';
import { createCar, listPublicCars } from '@/lib/db';
import { validateCar } from '@/lib/validate';
import { notifyNewCar } from '@/lib/telegram';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json({ cars: await listPublicCars() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ma'lumotlar bazasiga ulanib bo'lmadi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const { data, errors } = validateCar(body);
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: "Ma'lumotlarni tekshiring", errors }, { status: 422 });
  }

  try {
    const car = await createCar(data, 'pending');
    // Serverless funksiya yopilib qolmasligi uchun javobdan oldin kutamiz
    await notifyNewCar(car).catch((e) => console.error('Telegram xabar xatosi:', e));
    return NextResponse.json({ ok: true, id: car.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "E'lonni saqlab bo'lmadi. Keyinroq urinib ko'ring." }, { status: 500 });
  }
}
