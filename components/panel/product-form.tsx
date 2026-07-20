"use client";

import { useState, type FormEvent } from "react";
import { pb } from "@/lib/pocketbase";
import { useToast } from "@/components/panel/toast";
import { allergenLabels, badgeLabels } from "@/lib/labels";
import { Card, ErrorText, FormActions, Input, Label, Select } from "@/components/panel/ui";
import { ImageUploader } from "@/components/panel/image-uploader";
import { MultiLangFields } from "@/components/panel/multi-lang-fields";
import { activeLocales, mainLocale, type TranslatableField, type Translations } from "@/lib/i18n";
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
  const [image, setImage] = useState<string>(initial?.images?.[0] ?? "");
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
  const { toast } = useToast();

  function setBaseField(field: TranslatableField, value: string) {
    if (field === "name") setName(value);
    else if (field === "campaign_label") setCampaignLabel(value);
    else setDescription(value);
  }

  function toggle<T>(list: T[], value: T, setList: (v: T[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
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
      images: image ? [image] : [],
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
        ? await pb.collection("menuva_products").update<Product>(initial.id, payload)
        : await pb.collection("menuva_products").create<Product>({ ...payload, order: 999 });
      toast(initial ? "Ürün güncellendi" : "Ürün eklendi");
      onSaved(record);
    } catch {
      setError("Kaydedilemedi, alanları kontrol edip tekrar dene.");
      toast("Kaydedilemedi, tekrar dene.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormActions
        saving={saving}
        onCancel={onCancel}
        toggle={{ checked: isAvailable, onChange: setIsAvailable, label: "Satışta" }}
      />
      <ErrorText>{error}</ErrorText>

      <Card className="space-y-5">
        {/* Üstte solda kare görsel */}
        <div className="w-32">
          <Label>Ürün görseli</Label>
          <ImageUploader value={image} onChange={setImage} businessId={business.id} kind="product" aspect="aspect-square" />
        </div>

        {/* Altında dil sekmeleri — ana dil ilk sırada ve açık */}
        <MultiLangFields
          locales={activeLocales(business)}
          mainLocale={mainLocale(business)}
          base={{ name, description }}
          onBaseChange={setBaseField}
          translations={translations}
          onTranslationsChange={setTranslations}
          fields={[
            { key: "name", label: "Ürün adı", required: true, placeholder: "Izgara Köfte" },
            { key: "description", label: "Açıklama", multiline: true, rows: 3, placeholder: "El yapımı, közlenmiş biber ve pilav ile" },
          ]}
        />

        <div className="grid gap-3 sm:grid-cols-2">
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
            <Label htmlFor="p-price">Fiyat (₺)</Label>
            <Input id="p-price" type="number" min={0} step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="space-y-6">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-ink-soft">Hazırlanma süresi & kalori</p>
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
        </div>
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-ink-soft">Rozetler</p>
          <div className="flex flex-wrap gap-2">
            {ALL_BADGES.map((badge) => (
              <button
                type="button"
                key={badge}
                onClick={() => toggle(badges, badge, setBadges)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  badges.includes(badge)
                    ? "border-paprika bg-paprika text-paper"
                    : "border-line text-ink-soft hover:border-paprika hover:text-paprika"
                }`}
              >
                {badgeLabels.tr[badge]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-ink-soft">Alerjenler</p>
          <div className="flex flex-wrap gap-2">
            {ALL_ALLERGENS.map((allergen) => (
              <button
                type="button"
                key={allergen}
                onClick={() => toggle(allergens, allergen, setAllergens)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  allergens.includes(allergen)
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-ink-soft hover:border-ink"
                }`}
              >
                {allergenLabels.tr[allergen]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Kampanya</p>
        <div className="sm:max-w-[12rem]">
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
        {/* Kampanya etiketi de dil bazlı — ana dil baz alan, diğerleri çeviri */}
        <MultiLangFields
          locales={activeLocales(business)}
          mainLocale={mainLocale(business)}
          base={{ campaign_label: campaignLabel }}
          onBaseChange={setBaseField}
          translations={translations}
          onTranslationsChange={setTranslations}
          fields={[{ key: "campaign_label", label: "Etiket", placeholder: "Haftanın kampanyası" }]}
        />
      </Card>

      <ErrorText>{error}</ErrorText>
    </form>
  );
}
