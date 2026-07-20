import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { Badge, PageHeader } from "@/components/admin/ui";
import type { PlanRecord } from "@/lib/types";

export default async function AdminPlansPage() {
  const { pb } = await requireAdmin({ role: "super_admin" });
  const plans = await pb.collection("menuva_plans").getFullList<PlanRecord>({ sort: "order" });

  return (
    <div>
      <PageHeader
        title="Planlar"
        description="Abonelik paketleri, fiyatlar ve limitler."
        action={
          <Link
            href="/admin/plans/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-2.5 font-mono text-[13px] uppercase tracking-wider text-paper transition-colors hover:bg-paprika"
          >
            Yeni paket
          </Link>
        }
      />

      <div className="space-y-3">
        {plans.map((p) => (
          <Link key={p.id} href={`/admin/plans/${p.id}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-5 transition-colors hover:border-paprika/40">
              <div>
                <p className="font-display text-lg font-bold">{p.name}</p>
                <p className="text-xs text-ink-soft">
                  {p.key} · ₺{p.price_6m}/6ay · ₺{p.price_12m}/yıl
                </p>
              </div>
              <div className="flex items-center gap-2">
                {p.is_default && <Badge tone="success">Varsayılan</Badge>}
                <Badge tone={p.is_active ? "success" : "neutral"}>{p.is_active ? "Aktif" : "Pasif"}</Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
