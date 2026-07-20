import { headers } from "next/headers";
import type PocketBase from "pocketbase";

// Reverse proxy (Vercel/Nginx) arkasında gerçek istemci IP'sini x-forwarded-for'dan
// okur; yereldeyken veya header yoksa boş döner.
export async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  const forwarded = hdrs.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return hdrs.get("x-real-ip") ?? "";
}

export async function getUserAgent(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("user-agent") ?? "";
}

/**
 * admin_logs koleksiyonuna bir satır yazar. Çağıran taraf (server action) hatayı
 * yönetmesin diye burada yutuyoruz — bir log yazımının başarısız olması asıl
 * işlemi (kullanıcı güncelleme, bildirim gönderme vb.) engellememeli.
 */
export async function logAdminAction(
  pb: PocketBase,
  params: {
    admin?: string | null;
    action: string;
    target?: string;
    meta?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const [ip, userAgent] = await Promise.all([getClientIp(), getUserAgent()]);
    await pb.collection("menuva_admin_logs").create({
      admin: params.admin ?? null,
      action: params.action,
      target: params.target ?? "",
      meta: params.meta ?? {},
      ip,
      user_agent: userAgent,
    });
  } catch (err) {
    console.error("admin_logs yazılamadı:", err);
  }
}
