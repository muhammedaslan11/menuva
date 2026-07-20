"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/log";
import type { PlanLimits } from "@/lib/types";

export interface PlanFormInput {
  key: string;
  name: string;
  description: string;
  price6m: number;
  price12m: number;
  features: string[];
  limits: PlanLimits;
  isActive: boolean;
}

function validate(input: PlanFormInput): string | null {
  if (!/^[a-z0-9_]+$/.test(input.key)) return "Anahtar sadece küçük harf, rakam ve alt çizgi içerebilir.";
  if (!input.name.trim()) return "Ad gerekli.";
  if (input.price6m < 0 || input.price12m < 0) return "Fiyat negatif olamaz.";
  return null;
}

export async function createPlanAction(input: PlanFormInput): Promise<{ error?: string; id?: string }> {
  const err = validate(input);
  if (err) return { error: err };

  const { pb, admin } = await requireAdmin({ role: "super_admin" });

  try {
    const existing = await pb.collection("menuva_plans").getList(1, 1);
    const record = await pb.collection("menuva_plans").create({
      key: input.key,
      name: input.name,
      description: input.description,
      price_6m: input.price6m,
      price_12m: input.price12m,
      features: input.features,
      limits: input.limits,
      is_active: input.isActive,
      is_default: false,
      order: existing.totalItems,
    });
    await logAdminAction(pb, { admin: admin.id, action: "plan_create", target: record.id, meta: { key: input.key } });
    revalidatePath("/admin/plans", "page");
    return { id: record.id };
  } catch {
    return { error: "Oluşturulamadı — bu anahtar zaten kullanılıyor olabilir." };
  }
}

export async function updatePlanAction(id: string, input: PlanFormInput): Promise<{ error?: string }> {
  const err = validate(input);
  if (err) return { error: err };

  const { pb, admin } = await requireAdmin({ role: "super_admin" });

  try {
    await pb.collection("menuva_plans").update(id, {
      key: input.key,
      name: input.name,
      description: input.description,
      price_6m: input.price6m,
      price_12m: input.price12m,
      features: input.features,
      limits: input.limits,
      is_active: input.isActive,
    });
    await logAdminAction(pb, { admin: admin.id, action: "plan_update", target: id });
  } catch {
    return { error: "Güncellenemedi." };
  }

  revalidatePath("/admin/plans", "page");
  revalidatePath("/admin/plans/[id]", "page");
  return {};
}

export async function setDefaultPlanAction(id: string): Promise<{ error?: string }> {
  const { pb, admin } = await requireAdmin({ role: "super_admin" });

  try {
    const currentDefaults = await pb.collection("menuva_plans").getFullList({ filter: "is_default = true" });
    // requestKey: null — aynı koleksiyona eşzamanlı birden çok istek giderse
    // PocketBase SDK'sı varsayılan olarak öncekini auto-cancel eder.
    await Promise.all(
      currentDefaults
        .filter((p) => p.id !== id)
        .map((p) => pb.collection("menuva_plans").update(p.id, { is_default: false }, { requestKey: null }))
    );
    await pb.collection("menuva_plans").update(id, { is_default: true });
    await logAdminAction(pb, { admin: admin.id, action: "plan_set_default", target: id });
  } catch {
    return { error: "Varsayılan plan ayarlanamadı." };
  }

  revalidatePath("/admin/plans", "page");
  revalidatePath("/admin/plans/[id]", "page");
  return {};
}

export async function deletePlanAction(id: string): Promise<{ error?: string }> {
  const { pb, admin } = await requireAdmin({ role: "super_admin" });

  try {
    const plan = await pb.collection("menuva_plans").getOne(id);
    if (plan.is_default) {
      return { error: "Varsayılan plan silinemez — önce başka bir planı varsayılan yapın." };
    }
    await pb.collection("menuva_plans").delete(id);
    await logAdminAction(pb, { admin: admin.id, action: "plan_delete", target: id, meta: { key: plan.key } });
  } catch {
    return { error: "Silinemedi." };
  }

  revalidatePath("/admin/plans", "page");
  return {};
}
