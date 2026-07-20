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

// manageRule sadece auth tipi koleksiyonlarda anlamlı (users/admins) — diğerlerinde
// spec'te tanımlanmadığı için undefined ?? null === existing undefined ?? null olur,
// yani base koleksiyonlar için no-op kalır.
const RULE_KEYS = ["listRule", "viewRule", "createRule", "updateRule", "deleteRule", "manageRule"];

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
  const adminBypass = '@request.auth.collectionName = "menuva_admins"';
  const users = await getOrCreate({
    name: "menuva_users",
    type: "auth",
    listRule: `id = @request.auth.id || ${adminBypass}`,
    viewRule: `id = @request.auth.id || ${adminBypass}`,
    createRule: "",
    updateRule: `id = @request.auth.id || ${adminBypass}`,
    deleteRule: `id = @request.auth.id || ${adminBypass}`,
    // Auth koleksiyonlarında email gibi hassas alanlar viewRule'u karşılasa bile
    // emailVisibility=false ise gizli kalır — admin'in gerçekten görüp yönetebilmesi
    // için ayrı "manage" yetkisi (PocketBase'in auth koleksiyonlarına özel kural katmanı) gerekiyor.
    manageRule: adminBypass,
    fields: [text("name", { required: true, max: 120 }), ...stamps()],
  });

  // 2) admins (auth) — menuva yönetim paneli hesapları (işletme sahiplerinden
  // ayrı bir auth koleksiyonu; role diğer koleksiyonların kurallarında
  // `@request.auth.collectionName = "menuva_admins"` ile ayırt edilir).
  const admins = await getOrCreate({
    name: "menuva_admins",
    type: "auth",
    // Bir admin sadece kendini görebilir; super_admin herkesi.
    listRule: `id = @request.auth.id || (${adminBypass} && @request.auth.role = "super_admin")`,
    viewRule: `id = @request.auth.id || (${adminBypass} && @request.auth.role = "super_admin")`,
    // Admin hesapları API üzerinden self-serve oluşturulamaz; yalnızca
    // scripts/create-admin.mjs (superuser token ile) bootstrap eder.
    createRule: null,
    updateRule: `id = @request.auth.id || (${adminBypass} && @request.auth.role = "super_admin")`,
    deleteRule: `${adminBypass} && @request.auth.role = "super_admin"`,
    manageRule: `${adminBypass} && @request.auth.role = "super_admin"`,
    fields: [
      text("name", { required: true, max: 120 }),
      select("role", ["super_admin", "support"], { required: true, maxSelect: 1 }),
      ...stamps(),
    ],
  });

  // 3) businesses — işletmeler
  const businesses = await getOrCreate({
    name: "menuva_businesses",
    type: "base",
    listRule: `is_active = true || owner = @request.auth.id || ${adminBypass}`,
    viewRule: `is_active = true || owner = @request.auth.id || ${adminBypass}`,
    createRule: "@request.auth.id != '' && owner = @request.auth.id",
    updateRule: `owner = @request.auth.id || ${adminBypass}`,
    deleteRule: `owner = @request.auth.id || ${adminBypass}`,
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
      // Özel marka rengi (hex) — doluysa preset "theme" yerine kullanılır.
      text("theme_color", { max: 9 }),
      // Menü arka planı / yüzey tonu (lib/surfaces.ts anahtarı).
      text("menu_bg", { max: 20 }),
      // Menü yazı tipi (lib/fonts.ts anahtarı).
      text("font", { max: 20 }),
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
      // Not: mevcut kurulumlarda bu alanın seçenek listesini scripts/migrate-plans.mjs
      // genişletip veriyi eşleyerek daraltıyor (getOrCreate var olan alanları güncellemez,
      // sadece eksik alan ekler) — burada yalnızca sıfırdan kurulum için nihai değerler.
      select("plan", ["freemium", "premium", "elite"], { maxSelect: 1 }),
      boolField("is_active"),
      // İşletmenin ana (baz) dili — ana metinler bu dilde tutulur.
      select("main_language", ["tr", "en", "ar", "ru"], { maxSelect: 1 }),
      // Ana dil dışındaki aktif ek diller.
      select("languages", ["tr", "en", "ar", "ru"], { maxSelect: 3 }),
      json("translations"),
      ...stamps(),
    ],
    indexes: ["CREATE UNIQUE INDEX `idx_businesses_slug` ON `menuva_businesses` (`slug`)"],
  });

  // 4) categories — kategoriler
  const categories = await getOrCreate({
    name: "menuva_categories",
    type: "base",
    listRule: `business.is_active = true || business.owner = @request.auth.id || ${adminBypass}`,
    viewRule: `business.is_active = true || business.owner = @request.auth.id || ${adminBypass}`,
    createRule: "business.owner = @request.auth.id",
    updateRule: `business.owner = @request.auth.id || ${adminBypass}`,
    deleteRule: `business.owner = @request.auth.id || ${adminBypass}`,
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
    indexes: ["CREATE INDEX `idx_categories_business` ON `menuva_categories` (`business`)"],
  });

  // 5) products — ürünler
  const products = await getOrCreate({
    name: "menuva_products",
    type: "base",
    listRule: `business.is_active = true || business.owner = @request.auth.id || ${adminBypass}`,
    viewRule: `business.is_active = true || business.owner = @request.auth.id || ${adminBypass}`,
    createRule: "business.owner = @request.auth.id",
    updateRule: `business.owner = @request.auth.id || ${adminBypass}`,
    deleteRule: `business.owner = @request.auth.id || ${adminBypass}`,
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
      "CREATE INDEX `idx_products_business` ON `menuva_products` (`business`)",
      "CREATE INDEX `idx_products_category` ON `menuva_products` (`category`)",
    ],
  });

  // 6) product_options — varyant/seçenekler (Boy, Ekstra vb.)
  await getOrCreate({
    name: "menuva_product_options",
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
      json("translations"),
      ...stamps(),
    ],
    indexes: ["CREATE INDEX `idx_product_options_product` ON `menuva_product_options` (`product`)"],
  });

  // 7) popups — menü açılışında duyuru/kampanya
  await getOrCreate({
    name: "menuva_popups",
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
      json("translations"),
      ...stamps(),
    ],
    indexes: ["CREATE INDEX `idx_popups_business` ON `menuva_popups` (`business`)"],
  });

  // 8) reviews — müşteri değerlendirme anketi (giriş gerektirmez, herkes gönderebilir).
  // update/delete kilitli: işletme sahibi dahil kimse API'den değiştiremez/silemez (salt görüntüleme).
  await getOrCreate({
    name: "menuva_reviews",
    type: "base",
    listRule: `business.owner = @request.auth.id || ${adminBypass}`,
    viewRule: `business.owner = @request.auth.id || ${adminBypass}`,
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
    indexes: ["CREATE INDEX `idx_reviews_business` ON `menuva_reviews` (`business`)"],
  });

  // 9) events — menü ziyaretçi istatistikleri (sayfa/ürün görüntülenme, sepete ekleme).
  // Ziyaretçiler giriş yapmadığı için create herkese açık; okuma sadece işletme sahibine.
  await getOrCreate({
    name: "menuva_events",
    type: "base",
    listRule: `business.owner = @request.auth.id || ${adminBypass}`,
    viewRule: `business.owner = @request.auth.id || ${adminBypass}`,
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
    indexes: ["CREATE INDEX `idx_events_business` ON `menuva_events` (`business`)"],
  });

  // 10) plans — abonelik paketleri (fiyat/özellik/limit). Landing sayfası ve
  // panel kayıt akışı bu koleksiyondan besleniyor; admin dışında kimse yazamaz.
  await getOrCreate({
    name: "menuva_plans",
    type: "base",
    listRule: `is_active = true || ${adminBypass}`,
    viewRule: `is_active = true || ${adminBypass}`,
    // Fiyat/limit yönetimi hassas — sadece super_admin yazabilir (panel tarafında
    // requireAdmin({ role: "super_admin" }) zaten aynı kısıtı uyguluyor, bu DB
    // seviyesinde ikinci bir savunma katmanı).
    createRule: `${adminBypass} && @request.auth.role = "super_admin"`,
    updateRule: `${adminBypass} && @request.auth.role = "super_admin"`,
    deleteRule: `${adminBypass} && @request.auth.role = "super_admin"`,
    fields: [
      text("key", { required: true, max: 40, pattern: "^[a-z0-9_]+$" }),
      text("name", { required: true, max: 60 }),
      text("description", { max: 300 }),
      num("price_6m", { min: 0 }),
      num("price_12m", { min: 0 }),
      json("features"),
      json("limits"),
      boolField("is_active"),
      boolField("is_default"),
      num("order", { onlyInt: true }),
      ...stamps(),
    ],
    indexes: ["CREATE UNIQUE INDEX `idx_plans_key` ON `menuva_plans` (`key`)"],
  });

  // 11) support_tickets — işletme sahibinin admin'e açtığı destek talepleri.
  const supportTickets = await getOrCreate({
    name: "menuva_support_tickets",
    type: "base",
    listRule: `user = @request.auth.id || ${adminBypass}`,
    viewRule: `user = @request.auth.id || ${adminBypass}`,
    createRule: "@request.auth.id != '' && user = @request.auth.id",
    updateRule: `user = @request.auth.id || ${adminBypass}`,
    deleteRule: adminBypass,
    fields: [
      relation("business", businesses.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      relation("user", users.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      text("subject", { required: true, max: 150 }),
      select("status", ["open", "answered", "closed"], { required: true, maxSelect: 1 }),
      ...stamps(),
    ],
    indexes: [
      "CREATE INDEX `idx_support_tickets_user` ON `menuva_support_tickets` (`user`)",
      "CREATE INDEX `idx_support_tickets_business` ON `menuva_support_tickets` (`business`)",
    ],
  });

  // 12) ticket_messages — destek talebi mesaj akışı (kullanıcı <-> admin).
  // Gönderilmiş bir mesaj değiştirilemez/silinemez (audit trail).
  await getOrCreate({
    name: "menuva_ticket_messages",
    type: "base",
    listRule: `ticket.user = @request.auth.id || ${adminBypass}`,
    viewRule: `ticket.user = @request.auth.id || ${adminBypass}`,
    createRule: `(ticket.user = @request.auth.id && sender = "user") || (${adminBypass} && sender = "admin")`,
    updateRule: null,
    deleteRule: null,
    fields: [
      relation("ticket", supportTickets.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      select("sender", ["user", "admin"], { required: true, maxSelect: 1 }),
      relation("admin", admins.id, { maxSelect: 1 }),
      text("body", { required: true, max: 2000 }),
      ...stamps(),
    ],
    indexes: ["CREATE INDEX `idx_ticket_messages_ticket` ON `menuva_ticket_messages` (`ticket`)"],
  });

  // 13) notifications — admin'in gönderdiği toplu/tekil duyurular.
  // audience = "all" | "freemium" | "premium" | "elite" | "user" (bu durumda `user` dolu).
  const notifications = await getOrCreate({
    name: "menuva_notifications",
    type: "base",
    listRule: `audience = "all" || user = @request.auth.id || audience ?= @request.auth.menuva_businesses_via_owner.plan || ${adminBypass}`,
    viewRule: `audience = "all" || user = @request.auth.id || audience ?= @request.auth.menuva_businesses_via_owner.plan || ${adminBypass}`,
    createRule: adminBypass,
    updateRule: null,
    deleteRule: null,
    fields: [
      text("title", { required: true, max: 150 }),
      text("body", { required: true, max: 1000 }),
      select("audience", ["all", "freemium", "premium", "elite", "user"], { required: true, maxSelect: 1 }),
      relation("user", users.id, { maxSelect: 1 }),
      relation("created_by", admins.id, { maxSelect: 1 }),
      ...stamps(),
    ],
  });

  // 14) notification_reads — kullanıcı bazında okundu takibi (bildirim zili sayacı).
  await getOrCreate({
    name: "menuva_notification_reads",
    type: "base",
    listRule: `user = @request.auth.id || ${adminBypass}`,
    viewRule: `user = @request.auth.id || ${adminBypass}`,
    createRule: "@request.auth.id != '' && user = @request.auth.id",
    updateRule: null,
    deleteRule: null,
    fields: [
      relation("notification", notifications.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      relation("user", users.id, { required: true, cascadeDelete: true, maxSelect: 1 }),
      ...stamps(),
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_notification_reads_unique` ON `menuva_notification_reads` (`notification`,`user`)",
      "CREATE INDEX `idx_notification_reads_user` ON `menuva_notification_reads` (`user`)",
    ],
  });

  // 15) admin_logs — admin hareketleri + login geçmişi (action ~ "login" ile filtrelenir).
  // create herkese açık: login route'u başarısız girişimi (login_failed) admin token'ı
  // olmadan da kaydedebilsin diye. Kabul edilen risk: düşük değerli spam yazımı;
  // list/view sadece super_admin'e açık, satırlar hiçbir zaman API'den değiştirilemez/silinemez.
  await getOrCreate({
    name: "menuva_admin_logs",
    type: "base",
    listRule: `${adminBypass} && @request.auth.role = "super_admin"`,
    viewRule: `${adminBypass} && @request.auth.role = "super_admin"`,
    createRule: "",
    updateRule: null,
    deleteRule: null,
    fields: [
      relation("admin", admins.id, { maxSelect: 1 }),
      text("action", { required: true, max: 60 }),
      text("target", { max: 150 }),
      json("meta"),
      text("ip", { max: 64 }),
      text("user_agent", { max: 300 }),
      ...stamps(),
    ],
    indexes: [
      "CREATE INDEX `idx_admin_logs_admin` ON `menuva_admin_logs` (`admin`)",
      "CREATE INDEX `idx_admin_logs_action` ON `menuva_admin_logs` (`action`)",
    ],
  });

  console.log("\nŞema kurulumu tamamlandı.");
}

main().catch((err) => {
  console.error("Hata:", err?.response ?? err);
  process.exit(1);
});
