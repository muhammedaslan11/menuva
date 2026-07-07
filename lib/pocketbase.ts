import PocketBase from "pocketbase";

export const PB_URL = process.env.NEXT_PUBLIC_PB_URL ?? "http://127.0.0.1:8090";

// Tarayıcıda kullanılan tekil istemci — authStore'u localStorage'da tutar.
// Panel (client component) sayfaları bunu kullanır.
export const pb = new PocketBase(PB_URL);

// Sunucu bileşenlerinde / route handler'larda her istek için taze bir
// istemci oluşturur (paylaşılan authStore state'i istekler arası sızmasın diye).
export function createServerPB() {
  return new PocketBase(PB_URL);
}
