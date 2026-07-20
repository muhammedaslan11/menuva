"use client";

import { useState, type FormEvent } from "react";
import { pb } from "@/lib/pocketbase";
import { useToast } from "@/components/panel/toast";
import { Card, ErrorText, FormActions, Label } from "@/components/panel/ui";
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
  const { toast } = useToast();

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
        ? await pb.collection("menuva_categories").update<Category>(initial.id, payload)
        : await pb.collection("menuva_categories").create<Category>({ ...payload, business: business.id, order: order ?? 0 });
      toast(initial ? "Kategori güncellendi" : "Kategori eklendi");
      onSaved(record);
    } catch {
      setError("Kaydedilemedi, tekrar dene.");
      toast("Kaydedilemedi, tekrar dene.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormActions
          saving={saving}
          onCancel={onCancel}
          toggle={{ checked: isActive, onChange: setIsActive, label: "Menüde Göster" }}
        />
        <ErrorText>{error}</ErrorText>

        {/* Üstte solda kare görsel */}
        <div className="w-32">
          <Label>Kategori görseli</Label>
          <ImageUploader value={imageUrl} onChange={setImageUrl} businessId={business.id} kind="category" aspect="aspect-square" />
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
            { key: "name", label: "Kategori adı", required: true, placeholder: "Ana Yemekler" },
            { key: "description", label: "Açıklama", multiline: true },
          ]}
        />
      </form>
    </Card>
  );
}
