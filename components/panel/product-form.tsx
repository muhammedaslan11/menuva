"use client";

import { useState, type FormEvent } from "react";
import { pb } from "@/lib/pocketbase";
import { uploadFile } from "@/lib/upload";
import { allergenLabels, badgeLabels } from "@/lib/labels";
import { Button, Card, ErrorText, Input, Label, Select, Textarea } from "@/components/panel/ui";
import { TranslationsEditor } from "@/components/panel/translations-editor";
import type { Translations } from "@/lib/i18n";
import type { Allergen, Badge, Business, Category, Product } from "@/lib/types";

const ALL_ALLERGENS = Object.keys(allergenLabels.tr) as Allergen[];
const ALL_BADGES = Object.keys(badgeLabels.tr) as Badge[];

interface ProductFormProps {
  business: Business;
  categories: Category[];
  initial?: Product;
  onSaved: (product: Product) => void;
  onCancel?: () => void;
}

export function ProductForm({ business, categories, initial, onSaved, onCancel }: ProductFormProps) {
  const [category, setCategory] = useState(initial?.category ?? categories[0]?.id ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [prepMin, setPrepMin] = useState(initial?.prep_time_min?.toString() ?? "");
  const [prepMax, setPrepMax] = useState(initial?.prep_time_max?.toString() ?? "");
  const [calories, setCalories] = useState(initial?.calories?.toString() ?? "");
  const [allergens, setAllergens] = useState<Allergen[]>(initial?.allergens ?? []);
  const [badges, setBadges] = useState<Badge[]>(initial?.badges ?? []);
  const [isAvailable, setIsAvailable] = useState(initial?.is_available ?? true);
  const [discountPercent, setDiscountPercent] = useState(initial?.discount_percent?.toString() ?? "");
  const [campaignLabel, setCampaignLabel] = useState(initial?.campaign_label ?? "");
  const [translations, setTranslations] = useState<Translations>(initial?.translations ?? {});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggle<T>(list: T[], value: T, setList: (v: T[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => uploadFile(file, business.id, "product")));
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      setError("Görsel yüklenemedi, tekrar dene.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!category) {
      setError("Bir kategori seç.");
      return;
    }

    const payload = {
      business: business.id,
      category,
      name,
      description,
      price: Number(price) || 0,
      images,
      prep_time_min: prepMin ? Number(prepMin) : 0,
      prep_time_max: prepMax ? Number(prepMax) : 0,
      calories: calories ? Number(calories) : 0,
      allergens,
      badges,
      is_available: isAvailable,
      discount_percent: discountPercent ? Number(discountPercent) : 0,
      campaign_label: campaignLabel,
      translations,
    };

    setSaving(true);
    try {
      const record = initial
        ? await pb.collection("products").update<Product>(initial.id, payload)
        : await pb.collection("products").create<Product>({ ...payload, order: 999 });
      onSaved(record);
    } catch {
      setError("Kaydedilemedi, alanları kontrol edip tekrar dene.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="space-y-4">
        <div>
          <Label htmlFor="p-category">Kategori</Label>
          <Select id="p-category" required value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="p-name">Ürün adı</Label>
          <Input id="p-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Izgara Köfte" />
        </div>
        <div>
          <Label htmlFor="p-desc">Açıklama</Label>
          <Textarea
            id="p-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="El yapımı, közlenmiş biber ve pilav ile"
          />
        </div>
        <div>
          <Label htmlFor="p-price">Fiyat (₺)</Label>
          <Input
            id="p-price"
            type="number"
            min={0}
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          Çeviriler (opsiyonel) — boş bırakılırsa Türkçe gösterilir
        </p>
        <TranslationsEditor
          value={translations}
          onChange={setTranslations}
          fields={[
            { key: "name", label: "Ürün adı" },
            { key: "description", label: "Açıklama", multiline: true },
          ]}
        />
      </Card>

      <Card className="space-y-3">
        <Label>Görseller</Label>
        <div className="flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-xs text-paper"
                aria-label="Görseli kaldır"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border border-dashed border-line text-xs text-ink-soft hover:border-paprika hover:text-paprika">
            {uploading ? "…" : "+ Ekle"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleImageUpload(e.target.files)}
            />
          </label>
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Hazırlanma süresi & kalori</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="p-prep-min">Min (dk)</Label>
            <Input id="p-prep-min" type="number" min={0} value={prepMin} onChange={(e) => setPrepMin(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="p-prep-max">Maks (dk)</Label>
            <Input id="p-prep-max" type="number" min={0} value={prepMax} onChange={(e) => setPrepMax(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="p-calories">Kalori</Label>
            <Input id="p-calories" type="number" min={0} value={calories} onChange={(e) => setCalories(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Rozetler</p>
        <div className="flex flex-wrap gap-2">
          {ALL_BADGES.map((badge) => (
            <button
              type="button"
              key={badge}
              onClick={() => toggle(badges, badge, setBadges)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                badges.includes(badge)
                  ? "border-paprika bg-paprika text-paper"
                  : "border-line text-ink-soft hover:border-paprika hover:text-paprika"
              }`}
            >
              {badgeLabels.tr[badge]}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Alerjenler</p>
        <div className="flex flex-wrap gap-2">
          {ALL_ALLERGENS.map((allergen) => (
            <button
              type="button"
              key={allergen}
              onClick={() => toggle(allergens, allergen, setAllergens)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                allergens.includes(allergen)
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink-soft hover:border-ink"
              }`}
            >
              {allergenLabels.tr[allergen]}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Kampanya</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="p-discount">İndirim (%)</Label>
            <Input
              id="p-discount"
              type="number"
              min={0}
              max={100}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="p-campaign">Etiket</Label>
            <Input
              id="p-campaign"
              value={campaignLabel}
              onChange={(e) => setCampaignLabel(e.target.value)}
              placeholder="Haftanın kampanyası"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
          Satışta (stok var)
        </label>
      </Card>

      <ErrorText>{error}</ErrorText>

      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          Kaydet
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Vazgeç
          </Button>
        )}
      </div>
    </form>
  );
}
