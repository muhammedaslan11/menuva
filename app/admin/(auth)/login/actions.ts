"use server";

import { redirect } from "next/navigation";
import { ClientResponseError } from "pocketbase";
import { createServerPB } from "@/lib/pocketbase";
import { setAdminSessionCookie } from "@/lib/admin/session";
import { checkLoginRateLimit, resetLoginRateLimit } from "@/lib/admin/rate-limit";
import { getClientIp, logAdminAction } from "@/lib/admin/log";

export interface AdminLoginState {
  error?: string;
}

export async function adminLoginAction(_prevState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "E-posta ve şifre gerekli." };
  }

  const ip = await getClientIp();
  const rateLimitKey = `${ip}:${email.toLowerCase()}`;
  const rl = checkLoginRateLimit(rateLimitKey);
  if (!rl.allowed) {
    const minutes = Math.max(1, Math.ceil((rl.retryAfterSeconds ?? 0) / 60));
    return { error: `Çok fazla başarısız deneme. ${minutes} dakika sonra tekrar deneyin.` };
  }

  const pb = createServerPB();
  let token: string;
  let adminId: string;
  let adminEmail: string;
  try {
    const result = await pb.collection("menuva_admins").authWithPassword(email, password);
    token = result.token;
    adminId = result.record.id;
    adminEmail = result.record.email;
  } catch (err) {
    // login_failed: admin_logs.createRule herkese açık ("") olduğu için başarısız
    // girişimi kimlik doğrulaması olmadan da kaydedebiliyoruz (bkz. scripts/setup-pocketbase.mjs).
    await logAdminAction(pb, { admin: null, action: "login_failed", target: email });
    if (err instanceof ClientResponseError && err.isAbort) {
      return { error: "İstek iptal edildi, tekrar deneyin." };
    }
    return { error: "E-posta veya şifre hatalı." };
  }

  resetLoginRateLimit(rateLimitKey);
  await setAdminSessionCookie(token);
  await logAdminAction(pb, { admin: adminId, action: "login", target: adminEmail });

  redirect("/admin");
}
