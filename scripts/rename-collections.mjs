// Tek seferlik göç: mevcut koleksiyonların isimlerine `menuva_` öneki ekler.
// PocketBase collection rename işlemi id'yi ve tüm ilişkileri (relation'lar id
// üzerinden çalışır, isim üzerinden değil) korur — veri kaybı riski yok.
// Idempotent: eski isimde koleksiyon yoksa (zaten yeniden adlandırılmışsa) atlar.
//
// Kullanım: POCKETBASE_API_URL=... POCKETBASE_ADMIN_TOKEN=... node scripts/rename-collections.mjs

import PocketBase from "pocketbase";

const PB_URL = process.env.POCKETBASE_API_URL;
const PB_TOKEN = process.env.POCKETBASE_ADMIN_TOKEN;

if (!PB_URL || !PB_TOKEN) {
  console.error("POCKETBASE_API_URL ve POCKETBASE_ADMIN_TOKEN ortam değişkenleri gerekli.");
  process.exit(1);
}

const pb = new PocketBase(PB_URL);
pb.authStore.save(PB_TOKEN, null);

const RENAMES = [
  ["users", "menuva_users"],
  ["businesses", "menuva_businesses"],
  ["categories", "menuva_categories"],
  ["products", "menuva_products"],
  ["product_options", "menuva_product_options"],
  ["popups", "menuva_popups"],
  ["reviews", "menuva_reviews"],
  ["events", "menuva_events"],
];

async function main() {
  for (const [oldName, newName] of RENAMES) {
    let existing;
    try {
      existing = await pb.collections.getOne(oldName);
    } catch (err) {
      if (err?.status !== 404) throw err;
    }

    if (!existing) {
      // Eski isim yok — ya zaten yeniden adlandırılmış ya da hiç kurulmamış.
      try {
        await pb.collections.getOne(newName);
        console.log(`= ${oldName} zaten ${newName} olarak yeniden adlandırılmış, atlanıyor.`);
      } catch {
        console.log(`? ${oldName} bulunamadı (yeni ismi de yok) — muhtemelen henüz hiç kurulmamış, atlanıyor.`);
      }
      continue;
    }

    await pb.collections.update(existing.id, { name: newName });
    console.log(`~ ${oldName} -> ${newName} (id: ${existing.id})`);
  }

  console.log("\nYeniden adlandırma tamamlandı.");
}

main().catch((err) => {
  console.error("Hata:", err?.response ?? err);
  process.exit(1);
});
