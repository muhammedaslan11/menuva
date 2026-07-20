"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, ErrorText, Input, Label, Switch, Textarea } from "@/components/admin/ui";
import { createPlanAction, updatePlanAction, type PlanFormInput } from "@/app/admin/(dashboard)/plans/actions";
import type { PlanLimits, PlanRecord } from "@/lib/types";

const DEFAULT_LIMITS: PlanLimits = {
  max_businesses: 1,
  max_menus: 1,
  max_products: 30,
  analytics: false,
  custom_domain: false,
  branding_removal: false,
  campaigns: false,
  team_management: false,
  white_label: false,
  api_access: false,
};

function numOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function PlanForm({ initial }: { initial?: PlanRecord }) {
  const router = useRouter();
  const [key, setKey] = useState(initial?.key ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price6m, setPrice6m] = useState(String(initial?.price_6m ?? 0));
  const [price12m, setPrice12m] = useState(String(initial?.price_12m ?? 0));
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join("\n"));
  const [limits, setLimits] = useState<PlanLimits>(initial?.limits ?? DEFAULT_LIMITS);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function updateLimit<K extends keyof PlanLimits>(field: K, value: PlanLimits[K]) {
    setLimits((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const input: PlanFormInput = {
      key: key.trim(),
      name: name.trim(),
      description: description.trim(),
      price6m: Number(price6m) || 0,
      price12m: Number(price12m) || 0,
      features: featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      limits,
      isActive,
    };

    startTransition(async () => {
      if (initial) {
        const res = await updatePlanAction(initial.id, input);
        if (res.error) setError(res.error);
        else router.refresh();
        return;
      }

      const res = await createPlanAction(input);
      if (res.error) setError(res.error);
      else if (res.id) router.push(`/admin/plans/${res.id}`);
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="plan-key">Anahtar</Label>
            <Input
              id="plan-key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="ör. freemium"
              disabled={pending || Boolean(initial)}
            />
            {!initial && (
              <p className="mt-1 text-xs text-ink-soft">
                Sadece küçük harf/rakam/alt çizgi. "freemium", "premium" veya "elite" dışındaki anahtarlar
                işletmelere doğrudan atanamaz (businesses.plan alanı bu üçüyle sınırlı) — sadece pazarlama/gösterim
                amaçlı bir paket (ör. "Kurumsal — bize yazın") olarak kullanılabilir.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="plan-name">Ad</Label>
            <Input id="plan-name" value={name} onChange={(e) => setName(e.target.value)} disabled={pending} />
          </div>
        </div>

        <div>
          <Label htmlFor="plan-desc">Açıklama</Label>
          <Textarea
            id="plan-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="plan-price-6m">6 aylık fiyat (₺)</Label>
            <Input
              id="plan-price-6m"
              type="number"
              min={0}
              value={price6m}
              onChange={(e) => setPrice6m(e.target.value)}
              disabled={pending}
            />
          </div>
          <div>
            <Label htmlFor="plan-price-12m">Yıllık fiyat (₺)</Label>
            <Input
              id="plan-price-12m"
              type="number"
              min={0}
              value={price12m}
              onChange={(e) => setPrice12m(e.target.value)}
              disabled={pending}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="plan-features">Özellikler (her satır bir madde, fiyat kartında listelenir)</Label>
          <Textarea
            id="plan-features"
            rows={6}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            disabled={pending}
          />
        </div>

        <div>
          <Label>Limitler</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="plan-max-businesses">Maks. işletme</Label>
              <Input
                id="plan-max-businesses"
                type="number"
                min={0}
                value={limits.max_businesses ?? ""}
                placeholder="Sınırsız"
                onChange={(e) => updateLimit("max_businesses", numOrNull(e.target.value))}
                disabled={pending}
              />
            </div>
            <div>
              <Label htmlFor="plan-max-menus">Maks. menü</Label>
              <Input
                id="plan-max-menus"
                type="number"
                min={0}
                value={limits.max_menus ?? ""}
                placeholder="Sınırsız"
                onChange={(e) => updateLimit("max_menus", numOrNull(e.target.value))}
                disabled={pending}
              />
            </div>
            <div>
              <Label htmlFor="plan-max-products">Maks. ürün</Label>
              <Input
                id="plan-max-products"
                type="number"
                min={0}
                value={limits.max_products ?? ""}
                placeholder="Sınırsız"
                onChange={(e) => updateLimit("max_products", numOrNull(e.target.value))}
                disabled={pending}
              />
            </div>
          </div>
          <div className="mt-4 space-y-3 rounded-2xl border border-line p-4">
            <Switch checked={limits.analytics} onChange={(v) => updateLimit("analytics", v)} label="Gelişmiş analizler" />
            <Switch checked={limits.custom_domain} onChange={(v) => updateLimit("custom_domain", v)} label="Custom Domain" />
            <Switch
              checked={limits.branding_removal}
              onChange={(v) => updateLimit("branding_removal", v)}
              label="menuva markasını kaldırma"
            />
            <Switch checked={limits.campaigns} onChange={(v) => updateLimit("campaigns", v)} label="Kampanya oluşturma" />
            <Switch checked={limits.team_management} onChange={(v) => updateLimit("team_management", v)} label="Ekip yönetimi" />
            <Switch checked={limits.white_label} onChange={(v) => updateLimit("white_label", v)} label="White Label" />
            <Switch checked={limits.api_access} onChange={(v) => updateLimit("api_access", v)} label="API erişimi" />
          </div>
        </div>

        <Switch
          checked={isActive}
          onChange={setIsActive}
          label="Aktif"
          description="Pasif planlar landing sayfasında gösterilmez ve yeni işletmelere önerilmez."
        />

        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={pending}>
          {initial ? "Kaydet" : "Planı oluştur"}
        </Button>
      </form>
    </Card>
  );
}
