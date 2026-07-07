// İşletme sahibi kullanıcı adı ("kardelencafe") ya da tam URL yapıştırabilir;
// panelde ne yazıldıysa o saklanır, link sadece görüntülenirken kurulur.
function toUrl(base: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${base}${trimmed.replace(/^@/, "")}`;
}

export function instagramUrl(value: string): string {
  return toUrl("https://instagram.com/", value);
}

export function tiktokUrl(value: string): string {
  return toUrl("https://tiktok.com/@", value.replace(/^@/, ""));
}

export function youtubeUrl(value: string): string {
  return toUrl("https://youtube.com/", value);
}

export function facebookUrl(value: string): string {
  return toUrl("https://facebook.com/", value);
}

export function whatsappUrl(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}
