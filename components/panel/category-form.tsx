"use client";

import { useState, type FormEvent } from "react";
import { pb } from "@/lib/pocketbase";
import { Button, Card, ErrorText, Input, Label, Textarea } from "@/components/panel/ui";
import { TranslationsEditor } from "@/components/panel/translations-editor";
import type { Translations } from "@/lib/i18n";
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
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [translations, setTranslations] = useState<Translations>(initial?.translations ?? {});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const record = initial
        ? await pb.collection("categories").update<Category>(initial.id, {
            name,
            description,
            is_active: isActive,
            translations,
          })
        : await pb.collection("categories").create<Category>({
            business: business.id,
            name,
            description,
            is_active: isActive,
            translations,
            order: order ?? 0,
          });
      onSaved(record);
    } catch {
      setError("Kaydedilemedi, tekrar dene.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="cat-name">Kategori adı</Label>
          <Input id="cat-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ana Yemekler" />
        </div>
        <div>
          <Label htmlFor="cat-desc">Açıklama (opsiyonel)</Label>
          <Textarea id="cat-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Menüde görünsün
        </label>
        <div className="border-t border-line pt-4">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            Çeviriler (opsiyonel) — boş bırakılırsa Türkçe gösterilir
          </p>
          <TranslationsEditor
            value={translations}
            onChange={setTranslations}
            fields={[
              { key: "name", label: "Kategori adı" },
              { key: "description", label: "Açıklama", multiline: true },
            ]}
          />
        </div>
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
    </Card>
  );
}
