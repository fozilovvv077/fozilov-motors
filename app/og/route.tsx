import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/** Telegram / ijtimoiy tarmoqlarda havola ulashilganda chiqadigan rasm (1200×630) */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #0c0c0e 0%, #1c1c22 60%, #3a1408 100%)',
          color: '#f0eeea',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 20,
              background: '#ff4d1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              fontWeight: 800,
              color: '#0c0c0e',
            }}
          >
            F
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 2 }}>FOZILOV MOTORS</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>Avtomobil sotish</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, color: '#ff4d1a' }}>va sotib olish</div>
        </div>
        <div style={{ display: 'flex', gap: 60 }}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ width: 90, height: 8, borderRadius: 4, background: '#ff4d1a', opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
