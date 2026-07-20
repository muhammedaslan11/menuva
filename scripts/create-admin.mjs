// İlk (veya ek) admin hesabını oluşturur. admins koleksiyonunun createRule'ı
// null olduğu için (bkz. scripts/setup-pocketbase.mjs) bu yalnızca superuser
// token ile, bu script üzerinden yapılabilir — panelde self-serve kayıt yok.
// Kullanım:
//   POCKETBASE_API_URL=... POCKETBASE_ADMIN_TOKEN=... node scripts/create-admin.mjs <email> <şifre> [isim] [rol]
// rol: super_admin (varsayılan) | support

import PocketBase from "pocketbase";

const PB_URL = process.env.POCKETBASE_API_URL;
const PB_TOKEN = process.env.POCKETBASE_ADMIN_TOKEN;
const [email, password, name = "Admin", role = "super_admin"] = process.argv.slice(2);

if (!PB_URL || !PB_TOKEN) {
  console.error("POCKETBASE_API_URL ve POCKETBASE_ADMIN_TOKEN ortam değişkenleri gerekli.");
  process.exit(1);
}

if (!email || !password) {
  console.error("Kullanım: node scripts/create-admin.mjs <email> <şifre> [isim] [rol]");
  process.exit(1);
}

if (!["super_admin", "support"].includes(role)) {
  console.error(`Geçersiz rol: ${role} (super_admin | support olmalı)`);
  process.exit(1);
}

if (password.length < 8) {
  console.error("Şifre en az 8 karakter olmalı.");
  process.exit(1);
}

const pb = new PocketBase(PB_URL);
pb.authStore.save(PB_TOKEN, null);

(async () => {
  let existing;
  try {
    existing = await pb.collection("menuva_admins").getFirstListItem(pb.filter("email = {:email}", { email }));
  } catch (err) {
    if (err?.status !== 404) throw err;
  }

  if (existing) {
    console.error(`Bu e-postayla zaten bir admin var (id: ${existing.id}). Rolü değiştirmek için PocketBase yönetim arayüzünü kullanın.`);
    process.exit(1);
  }

  const created = await pb.collection("menuva_admins").create({
    email,
    password,
    passwordConfirm: password,
    name,
    role,
    emailVisibility: false,
    verified: true,
  });

  console.log(`Admin oluşturuldu: ${created.email} (id: ${created.id}, rol: ${created.role})`);
})().catch((err) => {
  console.error("Hata:", err?.response ?? err);
  process.exit(1);
});
