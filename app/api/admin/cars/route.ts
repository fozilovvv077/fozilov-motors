import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { listAllCars } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  try {
    return NextResponse.json({ cars: await listAllCars() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ma'lumotlar bazasiga ulanib bo'lmadi. DATABASE_URL ni tekshiring." }, { status: 500 });
  }
}
