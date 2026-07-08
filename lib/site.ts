// Menü adresleri subdomain tabanlı: vezirhan.menuva.app
// Kök alan adı deploy ortamına göre NEXT_PUBLIC_ROOT_DOMAIN ile değiştirilebilir.
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "menuva.app";

export function menuHost(slug: string): string {
  return `${slug}.${ROOT_DOMAIN}`;
}

// Panel/QR gibi yerlerde gösterilen tam menü adresi.
// Geliştirmede subdomain'ler `slug.localhost:3000` olarak çalışır
// (tarayıcılar *.localhost'u otomatik 127.0.0.1'e çözer).
export function menuUrl(slug: string): string {
  if (typeof window !== "undefined") {
    const { hostname, port, protocol } = window.location;
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      return `${protocol}//${slug}.localhost${port ? `:${port}` : ""}`;
    }
  }
  return `https://${menuHost(slug)}`;
}

// Satış/bilgi talepleri için WhatsApp hattı.
const WHATSAPP_NUMBER = "905357631908";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
