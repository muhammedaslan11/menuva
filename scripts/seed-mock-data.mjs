// Belirli bir işletmeye örnek ürün/seçenek/pop-up verisi ekler.
// Kategoriler zaten varsa isimle eşleştirip kullanır, yoksa oluşturur.
// Aynı isimde ürün zaten varsa tekrar eklemez (idempotent).
// Kullanım: POCKETBASE_API_URL=... POCKETBASE_ADMIN_TOKEN=... node scripts/seed-mock-data.mjs [slug]

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

const categoriesData = [
  {
    name: "Güne Başlarken",
    products: [
      { name: "Menemen", description: "Domates, biber, yumurta, baharatlar", price: 145, prep_time_min: 10, prep_time_max: 15, badges: ["sefin_onerisi"], allergens: ["yumurta"] },
      { name: "Avokadolu Tost", description: "Avokado, akkanaman peyniri, roka, tam buğday ekmek", price: 165, prep_time_min: 8, prep_time_max: 12, badges: ["vejetaryen"], allergens: ["gluten", "laktoz"] },
    ],
  },
  {
    name: "Başlangıçlar & Atıştırmalıklar",
    products: [
      { name: "Patates Kızartması", description: "Çıtır kesim, özel baharatlarla", price: 95, prep_time_min: 8, prep_time_max: 10, badges: ["vejetaryen", "vegan"] },
      { name: "Soğan Halkası", description: "Çıtır kaplamalı, barbekü sos ile", price: 110, prep_time_min: 10, prep_time_max: 12, allergens: ["gluten"] },
      { name: "Humus Tabağı", description: "Nohut ezmesi, zeytinyağı, sıcak pide", price: 120, prep_time_min: 8, prep_time_max: 10, badges: ["vejetaryen", "vegan"], allergens: ["gluten", "susam"] },
    ],
  },
  {
    name: "Ana Yemekler",
    products: [
      { name: "Izgara Köfte", description: "El yapımı, közlenmiş biber ve pilav ile", price: 285, prep_time_min: 15, prep_time_max: 20, calories: 540, badges: ["sefin_onerisi"] },
      { name: "Tavuk Şiş", description: "Marine edilmiş tavuk göğsü, bulgur pilavı, közlenmiş sebze", price: 245, prep_time_min: 20, prep_time_max: 25, calories: 480 },
      { name: "Mantarlı Risotto", description: "Kültür mantarı, parmesan, taze kekik", price: 240, prep_time_min: 20, prep_time_max: 25, calories: 610, badges: ["vejetaryen"], allergens: ["laktoz"] },
      {
        name: "Özel Burger",
        description: "Dana eti, cheddar, marul, domates, özel sos",
        price: 220,
        prep_time_min: 15,
        prep_time_max: 20,
        badges: ["populer"],
        allergens: ["gluten", "laktoz"],
        options: [
          { group_name: "Boy", name: "Tek Kat", price_delta: 0 },
          { group_name: "Boy", name: "Duble", price_delta: 45 },
          { group_name: "Ekstra", name: "Ekstra Peynir", price_delta: 15 },
        ],
      },
    ],
  },
  {
    name: "Salatalar",
    products: [
      { name: "Mevsim Salatası", description: "Roka, nar, ceviz, keçi peyniri", price: 165, prep_time_min: 10, prep_time_max: 10, calories: 320, badges: ["yeni", "glutensiz"], allergens: ["findik_fistik", "laktoz"] },
      { name: "Sezar Salata", description: "Izgara tavuk, parmesan, kruton, sezar sos", price: 195, prep_time_min: 12, prep_time_max: 15, allergens: ["gluten", "laktoz", "yumurta"] },
    ],
  },
  {
    name: "Tatlılar",
    products: [
      { name: "San Sebastian", description: "Yanık cheesecake, dilim", price: 150, prep_time_min: 5, prep_time_max: 5, calories: 430, badges: ["populer"], allergens: ["laktoz", "yumurta", "gluten"] },
      {
        name: "Sufle",
        description: "Sıcak çikolatalı sufle, vanilyalı dondurma ile",
        price: 175,
        prep_time_min: 12,
        prep_time_max: 15,
        badges: ["sefin_onerisi"],
        allergens: ["gluten", "laktoz", "yumurta"],
        discount_percent: 15,
        campaign_label: "Hafta sonu kampanyası",
      },
    ],
  },
  {
    name: "Sıcak İçecekler",
    products: [
      { name: "Türk Kahvesi", description: "Çifte kavrulmuş lokum eşliğinde", price: 70, prep_time_min: 8, prep_time_max: 8, calories: 45 },
      { name: "Filtre Kahve", description: "Günlük taze çekim", price: 65, prep_time_min: 5, prep_time_max: 5, badges: ["vegan"] },
      { name: "Elma Çayı", description: "Ev yapımı", price: 45, badges: ["vegan", "glutensiz"] },
    ],
  },
  {
    name: "Soğuk İçecekler",
    products: [
      { name: "Taze Sıkılmış Portakal Suyu", description: "Günlük taze sıkım", price: 95, badges: ["vegan", "glutensiz"] },
      {
        name: "Limonata",
        description: "Ev yapımı, naneli",
        price: 85,
        badges: ["vegan"],
        options: [
          { group_name: "Boy", name: "Orta", price_delta: 0 },
          { group_name: "Boy", name: "Büyük", price_delta: 20 },
        ],
      },
      { name: "Ice Latte", description: "Soğuk süt, espresso", price: 110, allergens: ["laktoz"] },
    ],
  },
];

async function findOrCreateCategory(businessId, name, order) {
  try {
    return await pb.collection("menuva_categories").getFirstListItem(
      pb.filter("business = {:b} && name = {:n}", { b: businessId, n: name })
    );
  } catch {
    const created = await pb.collection("menuva_categories").create({
      business: businessId,
      name,
      description: "",
      order,
      is_active: true,
    });
    console.log(`+ Kategori oluşturuldu: ${name}`);
    return created;
  }
}

async function productExists(businessId, categoryId, name) {
  try {
    await pb.collection("menuva_products").getFirstListItem(
      pb.filter("business = {:b} && category = {:c} && name = {:n}", { b: businessId, c: categoryId, n: name })
    );
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const business = await pb.collection("menuva_businesses").getFirstListItem(pb.filter("slug = {:slug}", { slug: SLUG }));
  console.log(`İşletme bulundu: ${business.name} (${business.id})`);

  const existingCats = await pb.collection("menuva_categories").getFullList({
    filter: pb.filter("business = {:id}", { id: business.id }),
  });
  let nextOrder = existingCats.length;

  let addedProducts = 0;
  for (const cat of categoriesData) {
    const category = await findOrCreateCategory(business.id, cat.name, nextOrder++);

    const existingProducts = await pb.collection("menuva_products").getFullList({
      filter: pb.filter("category = {:c}", { c: category.id }),
    });
    let prodOrder = existingProducts.length;

    for (const p of cat.products) {
      if (await productExists(business.id, category.id, p.name)) {
        console.log(`= ${cat.name} / ${p.name} zaten var, atlandı`);
        continue;
      }

      const product = await pb.collection("menuva_products").create({
        business: business.id,
        category: category.id,
        name: p.name,
        description: p.description ?? "",
        price: p.price,
        images: [],
        prep_time_min: p.prep_time_min ?? 0,
        prep_time_max: p.prep_time_max ?? 0,
        calories: p.calories ?? 0,
        allergens: p.allergens ?? [],
        badges: p.badges ?? [],
        is_available: true,
        order: prodOrder++,
        discount_percent: p.discount_percent ?? 0,
        campaign_label: p.campaign_label ?? "",
      });
      console.log(`+ ${cat.name} / ${product.name}`);
      addedProducts++;

      if (p.options) {
        let optOrder = 0;
        for (const opt of p.options) {
          await pb.collection("menuva_product_options").create({
            product: product.id,
            group_name: opt.group_name,
            name: opt.name,
            price_delta: opt.price_delta,
            order: optOrder++,
          });
        }
        console.log(`  + ${p.options.length} seçenek eklendi`);
      }
    }
  }

  const existingPopups = await pb.collection("menuva_popups").getList(1, 1, {
    filter: pb.filter("business = {:id}", { id: business.id }),
  });
  if (existingPopups.totalItems === 0) {
    await pb.collection("menuva_popups").create({
      business: business.id,
      title: "Hoş geldiniz! 👋",
      message: "Bu hafta sonu tatlılarda %15 indirim var, kaçırmayın!",
      image_url: "",
      is_active: true,
    });
    console.log("+ Pop-up eklendi");
  }

  console.log(`\nTamamlandı. ${addedProducts} yeni ürün eklendi.`);
}

main().catch((err) => {
  console.error("Hata:", err?.response ?? err);
  process.exit(1);
});
