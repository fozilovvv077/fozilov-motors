// Brauzer tomonida Telegram WebApp obyektiga xavfsiz murojaat
export function getTelegram(): any | null {
  if (typeof window === 'undefined') return null;
  const tg = (window as any).Telegram?.WebApp;
  // initData bo'sh bo'lsa — sayt oddiy brauzerda ochilgan
  return tg && tg.initData ? tg : null;
}

export function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
  const tg = getTelegram();
  try {
    if (!tg?.HapticFeedback) return;
    if (type === 'success' || type === 'error') tg.HapticFeedback.notificationOccurred(type);
    else tg.HapticFeedback.impactOccurred(type);
  } catch {}
}
