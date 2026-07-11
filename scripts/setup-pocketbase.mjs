// menuva Pocketbase şema kurulumu.
// Kullanım: POCKETBASE_API_URL=... POCKETBASE_ADMIN_TOKEN=... node scripts/setup-pocketbase.mjs
// Idempotent: koleksiyon zaten varsa dokunmadan atlar.

import PocketBase from "pocketbase";

const PB_URL = process.env.POCKETBASE_API_URL;
const PB_TOKEN = process.env.POCKETBASE_ADMIN_TOKEN;

if (!PB_URL || !PB_TOKEN) {
  console.error(
    "POCKETBASE_API_URL ve POCKETBASE_ADMIN_TOKEN ortam değişkenleri gerekli."
  );
  process.exit(1);
}

const pb = new PocketBase(PB_URL);
pb.authStore.save(PB_TOKEN, null);

const text = (name, opts = {}) => ({
  name,
  type: "text",
  required: opts.required ?? false,
  min: opts.min ?? 0,
  max: opts.max ?? 0,
  pattern: opts.pattern ?? "",
  presentable: opts.presentable ?? false,
});

const num = (name, opts = {}) => ({
  name,
  type: "number",
  required: opts.required ?? false,
  min: opts.min,
  max: opts.max,
  onlyInt: opts.onlyInt ?? false,
});

const boolField = (name) => ({ name, type: "bool" });

const json = (name) => ({ name, type: "json", maxSize: 2000000 });

const dateField = (name, opts = {}) => ({
  name,
  type: "date",
  required: opts.required ?? false,
});

const emailField = (name, opts = {}) => ({
  name,
  type: "email",
  required: opts.required ?? false,
  exceptDomains: null,
  onlyDomains: null,
});

const select = (name, values, opts = {}) => ({
  name,
  type: "select",
  required: opts.required ?? false,
  maxSelect: opts.maxSelect ?? 1,
  values,
});

const relation = (name, collectionId, opts = {}) => ({
  name,
  type: "relation",
  required: opts.required ?? false,
  collectionId,
  cascadeDelete: opts.cascadeDelete ?? false,
  minSelect: opts.minSelect ?? 0,
  maxSelect: opts.maxSelect ?? 1,
});

const autodate = (name, onCreate, onUpdate) => ({
  name,
  type: "autodate",
  onCreate,
  onUpdate,
});

const stamps = () => [autodate("created", true, false), autodate("updated", true, true)];

const RULE_KEYS = ["listRule", "viewRule", "createRule", "updateRule", "deleteRule"];

async function getOrCreate(spec) {
  let existing;
  try {
    existing = await pb.collections.getOne(spec.name);
  } catch (err) {
    if (err?.status !== 404) throw err;
  }

  if (!existing) {
    const created = await pb.collections.create(spec);
    console.log(`+ ${spec.name} oluşturuldu (id: ${created.id})`);
    return created;
  }

  // Koleksiyon zaten varsa verilere dokunmuyoruz, ama spec'te olup canlıda
  // eksik olan alanları ekliyor ve API kurallarını spec ile eşitliyoruz.
  // Böylece script hem ilk kurulum hem de sonraki şema/kural güncellemeleri
  // için tekrar tekrar çalıştırılabilir kalıyor.
  const existingNames = new Set(existing.fields.map((f) => f.name));
  const missingFields = spec.fields.filter((f) => !existingNames.has(f.name));

  const ruleChanges = {};
  for (const key of RULE_KEYS) {
    const wanted = spec[key] ?? null;
    if (wanted !== (existing[key] ?? null)) ruleChanges[key] = wanted;
  }

  if (missingFields.length === 0 && Object.keys(ruleChanges).length === 0) {
    console.log(`= ${spec.name} zaten güncel, atlanıyor (id: ${existing.id})`);
    return existing;
  }

  const updated = await pb.collections.update(existing.id, {
    ...ruleChanges,
    ...(missingFields.length > 0 ? { fields: [...existing.fields, ...missingFields] } : {}),
  });
  const parts = [];
  if (missingFields.length > 0) parts.push(`alanlar: ${missingFields.map((f) => f.name).join(", ")}`);
  if (Object.keys(ruleChanges).length > 0) parts.push(`kurallar: ${Object.keys(ruleChanges).join(", ")}`);
  console.log(`~ ${spec.name} güncellendi (${parts.join(" | ")})`);
  return updated;
}

async function main() {
  // 1) users (auth) — işletme sahibi hesapları
  const users = await getOrCreate({
    name: "users",
    type: "auth",
    listRule: "id = @request.auth.id",
    viewRule: "id = @request.auth.id",
    createRule: "",
    updateRule: "id = @request.auth.id",
    deleteRule: "id = @request.auth.id",
    fields: [text("name", { required: true, max: 120 }), ...stamps()],
  });

  // 2) businesses — işletmeler
  const businesses = await getOrCreate({
    name: "businesses",
    type: "base",
    listRule: "is_active = true || owner = @request.auth.id",
    viewRule: "is_active = true || owner = @request.auth.id",
    createRule: "@request.auth.id != '' && owner = @request.auth.id",
    updateRule: "owner = @request.auth.id",
    deleteRule: "owner = @request.auth.id",
    fields: [
      relation("owner", users.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      text("name", { required: true, max: 120 }),
      text("slug", { required: true, max: 60, pattern: "^[a-z0-9-]+$" }),
      text("description", { max: 500 }),
      emailField("email"),
      text("logo_url", { max: 500 }),
      text("cover_url", { max: 500 }),
      select("theme", [
        "paprika",
        "midnight",
        "emerald",
        "sunflower",
        "berry",
        "ocean",
        "forest",
        "plum",
        "copper",
        "slate",
      ], { maxSelect: 1 }),
      select("template", ["liste", "grid"], { maxSelect: 1 }),
      text("phone", { max: 30 }),
      text("address", { max: 300 }),
      text("working_hours", { max: 500 }),
      select(
        "highlights",
        [
          "wifi",
          "vale",
          "otopark",
          "cocuk_oyun_alani",
          "evcil_hayvan_dostu",
          "teras",
          "canli_muzik",
          "rezervasyon",
          "kredi_karti",
          "engelli_erisimi",
          "sigara_alani",
          "kahvalti",
        ],
        { maxSelect: 3 }
      ),
      text("whatsapp", { max: 30 }),
      text("instagram", { max: 150 }),
      text("tiktok", { max: 150 }),
      text("youtube", { max: 200 }),
      text("facebook", { max: 150 }),
      text("google_maps_url", { max: 500 }),
      text("google_review_url", { max: 500 }),
      text("wifi_password", { max: 60 }),
      select("plan", ["ucretsiz", "baslangic", "pro", "isletme"], { maxSelect: 1 }),
      boolField("is_active"),
      // İşletmenin ana (baz) dili — ana metinler bu dilde tutulur.
      select("main_language", ["tr", "en", "ar", "ru"], { maxSelect: 1 }),
      // Ana dil dışındaki aktif ek diller.
      select("languages", ["tr", "en", "ar", "ru"], { maxSelect: 3 }),
      json("translations"),
      ...stamps(),
    ],
    indexes: ["CREATE UNIQUE INDEX `idx_businesses_slug` ON `businesses` (`slug`)"],
  });

  // 3) categories — kategoriler
  const categories = await getOrCreate({
    name: "categories",
    type: "base",
    listRule: "business.is_active = true || business.owner = @request.auth.id",
    viewRule: "business.is_active = true || business.owner = @request.auth.id",
    createRule: "business.owner = @request.auth.id",
    updateRule: "business.owner = @request.auth.id",
    deleteRule: "business.owner = @request.auth.id",
    fields: [
      relation("business", businesses.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      text("name", { required: true, max: 120 }),
      text("description", { max: 300 }),
      text("image_url", { max: 500 }),
      num("order", { onlyInt: true }),
      boolField("is_active"),
      json("translations"),
      ...stamps(),
    ],
    indexes: ["CREATE INDEX `idx_categories_business` ON `categories` (`business`)"],
  });

  // 4) products — ürünler
  const products = await getOrCreate({
    name: "products",
    type: "base",
    listRule: "business.is_active = true || business.owner = @request.auth.id",
    viewRule: "business.is_active = true || business.owner = @request.auth.id",
    createRule: "business.owner = @request.auth.id",
    updateRule: "business.owner = @request.auth.id",
    deleteRule: "business.owner = @request.auth.id",
    fields: [
      relation("business", businesses.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      relation("category", categories.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      text("name", { required: true, max: 150 }),
      text("description", { max: 600 }),
      num("price", { required: true, min: 0 }),
      json("images"),
      num("prep_time_min", { min: 0, onlyInt: true }),
      num("prep_time_max", { min: 0, onlyInt: true }),
      num("calories", { min: 0, onlyInt: true }),
      select(
        "allergens",
        [
          "gluten",
          "laktoz",
          "yumurta",
          "findik_fistik",
          "yer_fistigi",
          "soya",
          "balik",
          "kabuklu_deniz_urunu",
          "susam",
          "hardal",
          "kereviz",
          "sulfit",
        ],
        { maxSelect: 12 }
      ),
      select("badges", ["yeni", "sefin_onerisi", "populer", "vejetaryen", "vegan", "aci", "glutensiz"], {
        maxSelect: 7,
      }),
      boolField("is_available"),
      num("order", { onlyInt: true }),
      num("discount_percent", { min: 0, max: 100 }),
      text("campaign_label", { max: 60 }),
      json("translations"),
      ...stamps(),
    ],
    indexes: [
      "CREATE INDEX `idx_products_business` ON `products` (`business`)",
      "CREATE INDEX `idx_products_category` ON `products` (`category`)",
    ],
  });

  // 5) product_options — varyant/seçenekler (Boy, Ekstra vb.)
  await getOrCreate({
    name: "product_options",
    type: "base",
    listRule: "product.business.is_active = true || product.business.owner = @request.auth.id",
    viewRule: "product.business.is_active = true || product.business.owner = @request.auth.id",
    createRule: "product.business.owner = @request.auth.id",
    updateRule: "product.business.owner = @request.auth.id",
    deleteRule: "product.business.owner = @request.auth.id",
    fields: [
      relation("product", products.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      text("group_name", { required: true, max: 60 }),
      text("name", { required: true, max: 60 }),
      num("price_delta"),
      num("order", { onlyInt: true }),
      ...stamps(),
    ],
    indexes: ["CREATE INDEX `idx_product_options_product` ON `product_options` (`product`)"],
  });

  // 6) popups — menü açılışında duyuru/kampanya
  await getOrCreate({
    name: "popups",
    type: "base",
    listRule: "business.is_active = true || business.owner = @request.auth.id",
    viewRule: "business.is_active = true || business.owner = @request.auth.id",
    createRule: "business.owner = @request.auth.id",
    updateRule: "business.owner = @request.auth.id",
    deleteRule: "business.owner = @request.auth.id",
    fields: [
      relation("business", businesses.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      text("title", { required: true, max: 120 }),
      text("message", { max: 400 }),
      text("image_url", { max: 500 }),
      boolField("is_active"),
      dateField("starts_at"),
      dateField("ends_at"),
      ...stamps(),
    ],
    indexes: ["CREATE INDEX `idx_popups_business` ON `popups` (`business`)"],
  });

  // 7) reviews — müşteri değerlendirme anketi (giriş gerektirmez, herkes gönderebilir).
  // update/delete kilitli: işletme sahibi dahil kimse API'den değiştiremez/silemez (salt görüntüleme).
  await getOrCreate({
    name: "reviews",
    type: "base",
    listRule: "business.owner = @request.auth.id",
    viewRule: "business.owner = @request.auth.id",
    createRule: "",
    updateRule: null,
    deleteRule: null,
    fields: [
      relation("business", businesses.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      boolField("is_first_visit"),
      num("hygiene", { min: 0, max: 5, onlyInt: true }),
      num("satisfaction", { min: 0, max: 5, onlyInt: true }),
      num("revisit", { min: 0, max: 5, onlyInt: true }),
      text("comment", { max: 1000 }),
      ...stamps(),
    ],
    indexes: ["CREATE INDEX `idx_reviews_business` ON `reviews` (`business`)"],
  });

  // 8) events — menü ziyaretçi istatistikleri (sayfa/ürün görüntülenme, sepete ekleme).
  // Ziyaretçiler giriş yapmadığı için create herkese açık; okuma sadece işletme sahibine.
  await getOrCreate({
    name: "events",
    type: "base",
    listRule: "business.owner = @request.auth.id",
    viewRule: "business.owner = @request.auth.id",
    createRule: "",
    updateRule: null,
    deleteRule: null,
    fields: [
      relation("business", businesses.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      select("type", ["page_view", "category_view", "product_view", "add_to_cart"], { required: true, maxSelect: 1 }),
      text("target", { max: 120 }),
      text("label", { max: 200 }),
      ...stamps(),
    ],
    indexes: ["CREATE INDEX `idx_events_business` ON `events` (`business`)"],
  });

  console.log("\nŞema kurulumu tamamlandı.");
}

main().catch((err) => {
  console.error("Hata:", err?.response ?? err);
  process.exit(1);
});
