"use client";

import { useState, type FormEvent } from "react";
import { pb } from "@/lib/pocketbase";
import { Card, ErrorText, FormActions, Label, Switch } from "@/components/panel/ui";
import { ImageUploader } from "@/components/panel/image-uploader";
import { MultiLangFields } from "@/components/panel/multi-lang-fields";
import { activeLocales, mainLocale, type TranslatableField, type Translations } from "@/lib/i18n";
import type { Business, Category } from "@/lib/types";

export function CategoryForm({
  business,
  initial,
  order,
  onSaved,
  onCancel,
}: {
  business: Business;
  initial?: Category;
  order?: number;
  onSaved: (category: Category) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [translations, setTranslations] = useState<Translations>(initial?.translations ?? {});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function setBaseField(field: TranslatableField, value: string) {
    if (field === "name") setName(value);
    else setDescription(value);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { name, description, image_url: imageUrl, is_active: isActive, translations };
      const record = initial
        ? await pb.collection("categories").update<Category>(initial.id, payload)
        : await pb.collection("categories").create<Category>({ ...payload, business: business.id, order: order ?? 0 });
      onSaved(record);
    } catch {
      setError("Kaydedilemedi, tekrar dene.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormActions saving={saving} onCancel={onCancel} />
        <ErrorText>{error}</ErrorText>

        {/* Resim en üstte */}
        <div>
          <Label>Kategori görseli</Label>
          <ImageUploader value={imageUrl} onChange={setImageUrl} businessId={business.id} kind="category" aspect="aspect-[3/1]" />
        </div>

        {/* Dil sekmeleri — ana dil ilk sırada ve açık */}
        <MultiLangFields
          locales={activeLocales(business)}
          mainLocale={mainLocale(business)}
          base={{ name, description }}
          onBaseChange={setBaseField}
          translations={translations}
          onTranslationsChange={setTranslations}
          fields={[
            { key: "name", label: "Kategori adı", required: true, placeholder: "Ana Yemekler" },
            { key: "description", label: "Açıklama", multiline: true },
          ]}
        />

        <div className="border-t border-line pt-4">
          <Switch checked={isActive} onChange={setIsActive} label="Menüde görünsün" description="Kapalıysa kategori müşteri menüsünde gizlenir." />
        </div>
      </form>
    </Card>
  );
}
