import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientResponseError } from "pocketbase";
import { requireAdmin } from "@/lib/admin/auth";
import { ArrowLeftIcon } from "@/components/icons";
import { PlanForm } from "@/components/admin/plan-form";
import { PlanDangerZone } from "@/components/admin/plan-danger-zone";
import type { PlanRecord } from "@/lib/types";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pb } = await requireAdmin({ role: "super_admin" });

  let plan: PlanRecord;
  try {
    plan = await pb.collection("menuva_plans").getOne<PlanRecord>(id);
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div>
      <Link href="/admin/plans" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-paprika">
        <ArrowLeftIcon size={15} />
        Planlara dön
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight">{plan.name}</h1>
      <div className="space-y-6">
        <PlanForm initial={plan} />
        <PlanDangerZone plan={plan} />
      </div>
    </div>
  );
}
