"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, ConfirmDialog, ErrorText } from "@/components/admin/ui";
import { deletePlanAction, setDefaultPlanAction } from "@/app/admin/(dashboard)/plans/actions";
import type { PlanRecord } from "@/lib/types";

export function PlanDangerZone({ plan }: { plan: PlanRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  function handleSetDefault() {
    setError("");
    startTransition(async () => {
      const res = await setDefaultPlanAction(plan.id);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    setError("");
    startTransition(async () => {
      const res = await deletePlanAction(plan.id);
      if (res.error) {
        setError(res.error);
        setConfirmDelete(false);
      } else {
        router.push("/admin/plans");
      }
    });
  }

  return (
    <Card className="border-paprika/30">
      <p className="font-display text-lg font-bold text-paprika">Tehlikeli bölge</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {!plan.is_default && (
          <Button type="button" variant="outline" disabled={pending} onClick={handleSetDefault}>
            Varsayılan yap
          </Button>
        )}
        <Button type="button" variant="danger" disabled={pending || plan.is_default} onClick={() => setConfirmDelete(true)}>
          Planı sil
        </Button>
      </div>
      {plan.is_default && <p className="mt-2 text-xs text-ink-soft">Varsayılan plan silinemez.</p>}
      <ErrorText>{error}</ErrorText>

      <ConfirmDialog
        open={confirmDelete}
        title="Planı sil"
        description="Bu plan kaydı kalıcı olarak silinecek. Bu plana atanmış işletmeler etkilenmez (mevcut plan değerleri korunur), ama bu paket artık admin panelinde ve landing sayfasında görünmez."
        confirmLabel="Evet, sil"
        loading={pending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Card>
  );
}
