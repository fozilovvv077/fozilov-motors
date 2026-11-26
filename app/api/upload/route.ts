import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX = 4 * 1024 * 1024; // Vercel so'rov limiti 4.5MB — rasm brauzerda oldindan siqiladi

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Rasm saqlash sozlanmagan (BLOB_READ_WRITE_TOKEN)" }, { status: 500 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
  }
  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Faqat rasm yuklash mumkin' }, { status: 415 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: 'Rasm hajmi 4MB dan oshmasin' }, { status: 413 });
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  try {
    const blob = await put(`cars/${Date.now()}.${ext}`, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Rasmni yuklab bo'lmadi" }, { status: 500 });
  }
}
