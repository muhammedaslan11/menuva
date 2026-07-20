import { redirect } from "next/navigation";
import type { RecordModel } from "pocketbase";
import { createServerPB } from "@/lib/pocketbase";
import { readAdminSessionToken } from "@/lib/admin/session";

export type AdminRole = "super_admin" | "support";

export interface AdminRecord extends RecordModel {
  name: string;
  email: string;
  role: AdminRole;
}

export interface AdminSession {
  pb: ReturnType<typeof createServerPB>;
  admin: AdminRecord;
}

// Cookie'deki token'ı her istekte PocketBase'e karşı doğrular (authRefresh),
// localStorage'a hiç dokunmadan tamamen sunucu tarafında çalışır. use-auth.ts'teki
// panel deseniyle aynı fikir (bkz. lib/use-auth.ts validate()) — sadece client
// state yerine her Server Component/Action çağrısında taze bir PB istemcisiyle.
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = await readAdminSessionToken();
  if (!token) return null;

  const pb = createServerPB();
  pb.authStore.save(token, null);

  try {
    const { record } = await pb.collection("menuva_admins").authRefresh<AdminRecord>();
    return { pb, admin: record };
  } catch {
    // Burada cookie'yi temizlemiyoruz: requireAdmin() Server Component'lerden
    // (page/layout) çağrılıyor ve Next.js render sırasında cookie yazılmasına
    // izin vermiyor ("Cookies can only be modified in a Server Action or Route
    // Handler"). Bozuk/süresi dolmuş cookie zararsız kalır — bir sonraki login
    // (setAdminSessionCookie, bir Server Action) onun üzerine yazar; logout ise
    // zaten kendi Server Action'ında temizliyor (bkz. app/admin/(dashboard)/actions.ts).
    return null;
  }
}

/**
 * Server Component / Server Action guard'ı.
 * - Oturum yoksa /admin/login'e yönlendirir.
 * - `role: "super_admin"` istenip mevcut admin "support" ise dashboard'a geri yönlendirir
 *   (super_admin her zaman geçer — daha geniş yetki, daha dar yetkiyi kapsar).
 */
export async function requireAdmin(opts?: { role?: AdminRole }): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (opts?.role === "super_admin" && session.admin.role !== "super_admin") {
    redirect("/admin");
  }

  return session;
}
