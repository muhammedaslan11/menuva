import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { ArrowLeftIcon } from "@/components/icons";
import { PlanForm } from "@/components/admin/plan-form";

export default async function NewPlanPage() {
  await requireAdmin({ role: "super_admin" });

  return (
    <div>
      <Link href="/admin/plans" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-paprika">
        <ArrowLeftIcon size={15} />
        Planlara dön
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight">Yeni paket</h1>
      <PlanForm />
    </div>
  );
}
