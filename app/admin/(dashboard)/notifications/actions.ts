"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/log";
import type { NotificationAudience } from "@/lib/types";

export async function sendNotificationAction(input: {
  title: string;
  body: string;
  audience: NotificationAudience;
  userEmail?: string;
}): Promise<{ error?: string }> {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) return { error: "Başlık ve mesaj gerekli." };

  const { pb, admin } = await requireAdmin();

  let userId: string | undefined;
  if (input.audience === "user") {
    const email = input.userEmail?.trim();
    if (!email) return { error: "Belirli kullanıcı için e-posta gerekli." };
    try {
      const user = await pb.collection("menuva_users").getFirstListItem(pb.filter("email = {:email}", { email }));
      userId = user.id;
    } catch {
      return { error: "Bu e-postayla bir kullanıcı bulunamadı." };
    }
  }

  try {
    await pb.collection("menuva_notifications").create({
      title,
      body,
      audience: input.audience,
      user: userId,
      created_by: admin.id,
    });
    await logAdminAction(pb, {
      admin: admin.id,
      action: "notification_send",
      target: userId ?? input.audience,
      meta: { audience: input.audience, title },
    });
  } catch {
    return { error: "Gönderilemedi." };
  }

  revalidatePath("/admin/notifications", "page");
  return {};
}
