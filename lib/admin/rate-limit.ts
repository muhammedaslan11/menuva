// Admin login denemeleri için basit bellek-içi sabit pencere hız sınırlayıcı.
// Tek Node instance varsayımı: yatay ölçeklenen (çoklu instance) bir deploy'da
// her instance kendi sayacını tutar — bu paylaşılan bir limit DEĞİLDİR, sadece
// kaba bir kötüye kullanım freni. Ciddi ölçekte Redis tabanlı bir çözüme taşınmalı.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface Entry {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, Entry>();

export function checkLoginRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

export function resetLoginRateLimit(key: string): void {
  attempts.delete(key);
}

// Bellek büyümesini sınırlamak için süresi geçmiş girişleri periyodik temizle.
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (now > entry.resetAt) attempts.delete(key);
  }
}, WINDOW_MS);
cleanupTimer.unref?.();
