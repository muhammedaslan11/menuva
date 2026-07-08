"use client";

import { useState, type FormEvent } from "react";
import { pb } from "@/lib/pocketbase";
import { uploadFile } from "@/lib/upload";
import { Button, Card, ErrorText, Input, Label, Textarea } from "@/components/panel/ui";
import type { Business, Popup } from "@/lib/types";

export function PopupForm({
  business,
  initial,
  onSaved,
  onCancel,
}: {
  business: Business;
  initial?: Popup;
  onSaved: (popup: Popup) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleImage(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, business.id, "popup");
      setImageUrl(url);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        business: business.id,
        title,
        message,
        image_url: imageUrl,
        is_active: isActive,
      };
      const record = initial
        ? await pb.collection("popups").update<Popup>(initial.id, payload)
        : await pb.collection("popups").create<Popup>(payload);
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
          <Label htmlFor="pop-title">Başlık</Label>
          <Input id="pop-title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bu hafta sonuna özel!" />
        </div>
        <div>
          <Label htmlFor="pop-message">Mesaj</Label>
          <Textarea id="pop-message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div>
          <Label>Görsel (opsiyonel)</Label>
          <div className="flex items-center gap-4">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
            )}
            <label className="cursor-pointer rounded-full border border-line px-4 py-2 font-mono text-[12px] uppercase tracking-wider text-ink-soft hover:border-paprika hover:text-paprika">
              {uploading ? "Yükleniyor…" : "Görsel yükle"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleImage(e.target.files)}
              />
            </label>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Aktif (menüde gösterilsin)
        </label>
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
