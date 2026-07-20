"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/log";
import type { Plan } from "@/lib/types";

const PLAN_VALUES: Plan[] = ["freemium", "premium", "elite"];

export async function updateBusinessPlanAction(businessId: string, plan: string): Promise<{ error?: string }> {
  if (!PLAN_VALUES.includes(plan as Plan)) return { error: "Geçersiz plan." };
  const { pb, admin } = await requireAdmin();

  try {
    await pb.collection("menuva_businesses").update(businessId, { plan });
    await logAdminAction(pb, {
      admin: admin.id,
      action: "business_plan_change",
      target: businessId,
      meta: { plan },
    });
  } catch {
    return { error: "Plan güncellenemedi." };
  }

  revalidatePath("/admin/users/[id]", "page");
  return {};
}

export async function setBusinessActiveAction(businessId: string, isActive: boolean): Promise<{ error?: string }> {
  const { pb, admin } = await requireAdmin();

  try {
    await pb.collection("menuva_businesses").update(businessId, { is_active: isActive });
    await logAdminAction(pb, {
      admin: admin.id,
      action: isActive ? "business_activate" : "business_deactivate",
      target: businessId,
    });
  } catch {
    return { error: "İşletme durumu güncellenemedi." };
  }

  revalidatePath("/admin/users/[id]", "page");
  return {};
}

// "Hesabı pasifleştir": users koleksiyonunda ayrı bir is_active alanı yok —
// bu uygulamada gerçekten bir şeyi kapatan alan businesses.is_active (menü
// görünürlüğünü ve public erişimi gerçekten kapatıyor). Bu yüzden hesap
// seviyesinde sahte bir bayrak icat etmek yerine, kullanıcının TÜM
// işletmelerini toplu olarak pasif/aktif yapıyoruz — gerçek etkisi olan tek yol bu.
export async function setAllUserBusinessesActiveAction(
  userId: string,
  isActive: boolean
): Promise<{ error?: string }> {
  const { pb, admin } = await requireAdmin();

  try {
    const businesses = await pb.collection("menuva_businesses").getFullList({
      filter: pb.filter("owner = {:userId}", { userId }),
      fields: "id",
    });
    // requestKey: null — aynı koleksiyona eşzamanlı birden çok istek giderse
    // PocketBase SDK'sı varsayılan olarak öncekini auto-cancel eder.
    await Promise.all(
      businesses.map((b) => pb.collection("menuva_businesses").update(b.id, { is_active: isActive }, { requestKey: null }))
    );
    await logAdminAction(pb, {
      admin: admin.id,
      action: isActive ? "user_activate_all" : "user_deactivate_all",
      target: userId,
      meta: { businessCount: businesses.length },
    });
  } catch {
    return { error: "İşlem gerçekleştirilemedi." };
  }

  revalidatePath("/admin/users/[id]", "page");
  return {};
}

export async function deleteUserAction(userId: string): Promise<{ error?: string }> {
  const { pb, admin } = await requireAdmin();

  try {
    await pb.collection("menuva_users").delete(userId);
    await logAdminAction(pb, { admin: admin.id, action: "user_delete", target: userId });
  } catch {
    return { error: "Kullanıcı silinemedi." };
  }

  revalidatePath("/admin/users", "page");
  return {};
}
