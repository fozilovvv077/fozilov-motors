# 🚗 Fozilov Motors

Avtomobil sotish va sotib olish sayti. Next.js 14 + Tailwind + Framer Motion, Vercel uchun tayyor, Telegram bot va Mini App bilan ishlaydi.

## Imkoniyatlar

- **Bosh sahifa**: avtomobillar kartochkalari, qidiruv, filtrlar (marka, yoqilg'i, uzatmalar qutisi, yil, narx, valyuta), saralash
- **Mashina sahifasi**: rasmlar galereyasi (barmoq bilan surish), to'liq xususiyatlar, sotuvchi
- **"Sotib olish" tugmasi**: telefonda darhol sotuvchiga qo'ng'iroq qiladi, kompyuterda raqam va "nusxa olish" tugmasini ko'rsatadi
- **E'lon joylash**: barcha ma'lumotlar, narx ($ / so'm), 10 tagacha rasm (drag & drop, avtomatik siqish, tartibini sudrab o'zgartirish), +998 raqam tekshiruvi
- **Admin panel**: **logotipni 2 marta bosing** (telefonda 2 marta tegining) → `/admin`
  - e'lonlarni tasdiqlash, rad etish, tahrirlash, o'chirish, "sotildi" deb belgilash
  - statistika, qidiruv, Telegram botni bir tugma bilan ulash
- **Telegram**: yangi e'lon kelganda botga rasm bilan xabar keladi, **✅ Tasdiqlash / ❌ Rad etish** tugmalari to'g'ridan-to'g'ri botda ishlaydi; sayt Telegram Mini App sifatida ham ochiladi
- Har bir elementda animatsiya, qorong'i/yorug' rejim, telefon/planshet/kompyuterga moslashgan

## Loyiha tuzilmasi

```
app/
  page.tsx                 bosh sahifa
  car/[id]/page.tsx        mashina sahifasi
  elon/page.tsx            e'lon joylash
  admin/page.tsx           admin panel
  admin/login/page.tsx     admin kirish
  og/route.tsx             Telegram'da ulashilganda chiqadigan rasm
  api/cars                 e'lonlar (GET ro'yxat, POST yangi)
  api/upload               rasm yuklash (Vercel Blob)
  api/admin/*              admin API (login, logout, cars, telegram-setup)
  api/telegram/webhook     Telegram bot webhook
components/                UI komponentlar
lib/                       baza, auth, telegram, tekshiruv
middleware.ts              /admin himoyasi
```

## 🚀 Vercel'ga joylash (qadamma-qadam)

1. **GitHub'ga yuklang**: yangi repozitoriy oching va shu papkadagi fayllarni yuklang.
2. **Vercel'da import qiling**: [vercel.com/new](https://vercel.com/new) → repozitoriyni tanlang → *Deploy*. (Birinchi deploy bazasiz ham ochiladi.)
3. **Ma'lumotlar bazasi**: Vercel loyihasi → **Storage** → **Create Database** → **Neon (Postgres)** → loyihaga ulang. `DATABASE_URL` avtomatik qo'shiladi. Jadval birinchi so'rovda o'zi yaratiladi.
4. **Rasmlar ombori**: **Storage** → **Create** → **Blob** → loyihaga ulang. `BLOB_READ_WRITE_TOKEN` avtomatik qo'shiladi.
5. **Environment Variables** (Settings → Environment Variables) — quyidagilarni qo'shing:

   | Nomi | Qiymati |
   |---|---|
   | `ADMIN_LOGIN` | `fozilov` |
   | `ADMIN_PASSWORD` | `1771` |
   | `SESSION_SECRET` | uzun tasodifiy satr (32+ belgi) |
   | `NEXT_PUBLIC_SITE_URL` | `https://sizning-sayt.vercel.app` |
   | `TELEGRAM_BOT_TOKEN` | @BotFather'dan |
   | `TELEGRAM_ADMIN_CHAT_ID` | sizning chat ID |
   | `TELEGRAM_WEBHOOK_SECRET` | masalan `fozilov_secret_2026` (faqat harf, raqam, `_`, `-`) |

6. **Redeploy**: Deployments → oxirgi deploy → ⋯ → *Redeploy* (yangi o'zgaruvchilar kuchga kirishi uchun).

## ✈️ Telegram botni ulash

1. Telegram'da **@BotFather** → `/newbot` → nom bering → **token**ni oling → `TELEGRAM_BOT_TOKEN` ga yozing.
2. Chat ID'ni bilish: **@userinfobot** ga yozing (yoki bot ulangandan keyin o'z botingizga `/id` yuboring) → `TELEGRAM_ADMIN_CHAT_ID` ga yozing.
3. Redeploy qiling.
4. Saytda logotipni 2 marta bosing → admin panelga kiring → **"✈️ Telegram botni ulash"** tugmasini bosing. Bu:
   - webhook'ni `https://sayt/api/telegram/webhook` ga o'rnatadi (maxfiy token bilan),
   - bot menyusiga "Fozilov Motors" Mini App tugmasini qo'shadi,
   - `/start`, `/elon`, `/id` buyruqlarini o'rnatadi.
5. Botga `/start` yozing — sayt Telegram ichida ochiladi.

**Muqobil (qo'lda)**: brauzerda oching:
`https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://sayt.vercel.app/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>`

**Mini App sifatida (ixtiyoriy)**: @BotFather → `/newapp` yoki *Bot Settings → Menu Button* → sayt manzilini kiriting.

### Telegram bilan muammo bo'lmasligi uchun nimalar qilingan
- Webhook har doim `200` qaytaradi — Telegram xabarlarni qayta-qayta yubormaydi
- Webhook `X-Telegram-Bot-Api-Secret-Token` bilan himoyalangan
- Telegram xatosi sayt ishlashini to'xtatmaydi (e'lon baribir saqlanadi)
- Rasm yuborib bo'lmasa, oddiy matn yuboriladi
- `frame-ancestors` sozlangan — Telegram Web (web.telegram.org) Mini App'ni iframe ichida ocha oladi
- Admin cookie `SameSite=None; Secure` — Telegram Web ichida ham login ishlaydi
- Telegram ichida: `ready()`, `expand()`, mavzu ranglari, vibratsiya (haptic), double-tap admin kirishi
- Link ulashilganda chiroyli rasm va sarlavha chiqadi (Open Graph)

## 💻 Kompyuterda ishga tushirish

```bash
npm install
cp .env.example .env.local   # qiymatlarni to'ldiring
npm run dev                  # http://localhost:3000
```

> Telegram webhook faqat `https://` manzilda ishlaydi, shuning uchun bot funksiyalarini Vercel'dagi saytda sinang.

## 🔐 Xavfsizlik
- Login va parol kodda yo'q — faqat Environment Variables'da.
- Sessiya HMAC bilan imzolangan httpOnly cookie; `/admin` va `/api/admin` middleware bilan himoyalangan.
- **Tavsiya**: ishga tushirgandan keyin `ADMIN_PASSWORD` ni uzunroq va murakkabroq parolga almashtiring (4 xonali raqamni taxmin qilish oson).
