"use server";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { clearAdminSessionCookie } from "@/lib/admin/session";
import { logAdminAction } from "@/lib/admin/log";

export async function adminLogoutAction(): Promise<void> {
  const session = await getAdminSession();
  if (session) {
    await logAdminAction(session.pb, {
      admin: session.admin.id,
      action: "logout",
      target: session.admin.email,
    });
  }
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
