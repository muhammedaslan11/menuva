import { cookies } from "next/headers";

// Not: bu modül yalnızca server-side (Server Component/Action) bağlamlarından
// import edilmeli — projede "server-only" paketi kullanılmıyor (bkz. lib/pocketbase.ts
// createServerPB yorumu), aynı disiplin burada da korunuyor.

export const ADMIN_COOKIE = "menuva_admin_auth";

// PocketBase admin auth token'ının süresiyle hizalı (varsayılan koleksiyon
// ayarı 7 gün). Next.js Server Component render'ı sırasında cookie yazılamaz
// (yalnızca Server Action / Route Handler içinde mümkün) — bu yüzden burada
// istek başına "sliding" bir süre uzatması yapmıyoruz; süre dolunca admin
// tekrar giriş yapar.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function setAdminSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function readAdminSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value ?? null;
}
