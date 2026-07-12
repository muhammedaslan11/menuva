"use client";

import { useState, type FormEvent } from "react";
import { pb } from "@/lib/pocketbase";
import { Card, ErrorText, FormActions, Input, Label, Textarea } from "@/components/panel/ui";
import { ImageUploader } from "@/components/panel/image-uploader";
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
        <FormActions
          saving={saving}
          onCancel={onCancel}
          toggle={{ checked: isActive, onChange: setIsActive, label: "Aktif" }}
        />
        <ErrorText>{error}</ErrorText>

        {/* Üstte solda kare görsel */}
        <div className="w-32">
          <Label>Görsel (opsiyonel)</Label>
          <ImageUploader value={imageUrl} onChange={setImageUrl} businessId={business.id} kind="popup" aspect="aspect-square" />
        </div>
        <div>
          <Label htmlFor="pop-title">Başlık</Label>
          <Input id="pop-title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bu hafta sonuna özel!" />
        </div>
        <div>
          <Label htmlFor="pop-message">Mesaj</Label>
          <Textarea id="pop-message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
      </form>
    </Card>
  );
}
