// Bir işletmenin BOŞ olan bilgi alanlarını örnek verilerle doldurur.
// Dolu alanlara (ör. panelden seçilmiş tema) dokunmaz.
// Kullanım: POCKETBASE_API_URL=... POCKETBASE_ADMIN_TOKEN=... node scripts/migrate-alpha-data.mjs [slug]

import PocketBase from "pocketbase";

const PB_URL = process.env.POCKETBASE_API_URL;
const PB_TOKEN = process.env.POCKETBASE_ADMIN_TOKEN;
const SLUG = process.argv[2] ?? "alpha";

if (!PB_URL || !PB_TOKEN) {
  console.error("POCKETBASE_API_URL ve POCKETBASE_ADMIN_TOKEN ortam değişkenleri gerekli.");
  process.exit(1);
}

const pb = new PocketBase(PB_URL);
pb.authStore.save(PB_TOKEN, null);

const defaults = {
  theme: "paprika",
  email: "info@alphacafe.com",
  working_hours: "Pazartesi - Cuma: 09:00 - 22:00\nCumartesi - Pazar: 10:00 - 23:00",
  highlights: ["wifi", "otopark", "teras"],
  whatsapp: "+905357631908",
  instagram: "alphacafe",
  tiktok: "alphacafe",
  youtube: "@alphacafe",
  facebook: "alphacafe",
  google_maps_url: "https://maps.google.com/maps?q=Sar%C4%B1yer+%C4%B0stanbul",
  wifi_password: "alpha2026",
};

(async () => {
  const business = await pb.collection("businesses").getFirstListItem(pb.filter("slug = {:slug}", { slug: SLUG }));
  console.log(`İşletme bulundu: ${business.name} (${business.id})`);

  const patch = {};
  for (const [key, value] of Object.entries(defaults)) {
    const current = business[key];
    const isEmpty = Array.isArray(current) ? current.length === 0 : !current;
    if (isEmpty) patch[key] = value;
  }

  if (Object.keys(patch).length === 0) {
    console.log("Tüm alanlar zaten dolu, değişiklik yapılmadı.");
    return;
  }

  await pb.collection("businesses").update(business.id, patch);
  console.log("Doldurulan alanlar:", Object.keys(patch).join(", "));
})().catch((err) => {
  console.error("Hata:", err?.response ?? err);
  process.exit(1);
});
