"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, ConfirmDialog, Label, Select } from "@/components/admin/ui";
import { planLabels } from "@/lib/labels";
import type { Business, Plan } from "@/lib/types";
import {
  deleteUserAction,
  setAllUserBusinessesActiveAction,
  setBusinessActiveAction,
  updateBusinessPlanAction,
} from "@/app/admin/(dashboard)/users/[id]/actions";

function BusinessCard({ business }: { business: Business }) {
  const [plan, setPlan] = useState<Plan>(business.plan);
  const [isActive, setIsActive] = useState(business.is_active);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handlePlanChange(next: Plan) {
    const previous = plan;
    setPlan(next);
    setError("");
    startTransition(async () => {
      const res = await updateBusinessPlanAction(business.id, next);
      if (res.error) {
        setError(res.error);
        setPlan(previous);
      }
    });
  }

  function handleToggleActive() {
    const next = !isActive;
    setIsActive(next);
    setError("");
    startTransition(async () => {
      const res = await setBusinessActiveAction(business.id, next);
      if (res.error) {
        setError(res.error);
        setIsActive(!next);
      }
    });
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">{business.name}</p>
          <p className="text-xs text-ink-soft">{business.slug}</p>
        </div>
        <Badge tone={isActive ? "success" : "neutral"}>{isActive ? "Aktif" : "Pasif"}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor={`plan-${business.id}`}>Plan</Label>
          <Select
            id={`plan-${business.id}`}
            value={plan}
            disabled={pending}
            onChange={(e) => handlePlanChange(e.target.value as Plan)}
            className="w-auto"
          >
            <option value="freemium">{planLabels.freemium}</option>
            <option value="premium">{planLabels.premium}</option>
            <option value="elite">{planLabels.elite}</option>
          </Select>
        </div>
        <Button type="button" variant="outline" disabled={pending} onClick={handleToggleActive}>
          {isActive ? "İşletmeyi pasifleştir" : "İşletmeyi aktifleştir"}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-paprika-deep">{error}</p>}
    </Card>
  );
}

export function UserDetail({ userId, businesses }: { userId: string; businesses: Business[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const anyActive = businesses.some((b) => b.is_active);

  function handleBulkToggle() {
    setError("");
    startTransition(async () => {
      const res = await setAllUserBusinessesActiveAction(userId, !anyActive);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    setError("");
    startTransition(async () => {
      const res = await deleteUserAction(userId);
      if (res.error) {
        setError(res.error);
        setConfirmDelete(false);
      } else {
        router.push("/admin/users");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {businesses.length === 0 && (
          <Card>
            <p className="text-sm text-ink-soft">Bu kullanıcının henüz bir işletmesi yok.</p>
          </Card>
        )}
        {businesses.map((b) => (
          <BusinessCard key={b.id} business={b} />
        ))}
      </div>

      <Card className="border-paprika/30">
        <p className="font-display text-lg font-bold text-paprika">Tehlikeli bölge</p>
        <p className="mt-1 text-sm text-ink-soft">
          Bu işlemler geri alınamaz veya kullanıcının erişimini doğrudan etkiler.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {businesses.length > 0 && (
            <Button type="button" variant="outline" disabled={pending} onClick={handleBulkToggle}>
              {anyActive ? "Tüm işletmeleri pasifleştir" : "Tüm işletmeleri aktifleştir"}
            </Button>
          )}
          <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
            Kullanıcıyı sil
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-paprika-deep">{error}</p>}
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Kullanıcıyı sil"
        description="Bu kullanıcı ve sahip olduğu tüm işletmeler (kategoriler, ürünler, popup'lar dahil) kalıcı olarak silinecek. Bu işlem geri alınamaz."
        confirmLabel="Evet, sil"
        loading={pending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
