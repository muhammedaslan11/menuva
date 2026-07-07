"use client";

import { useEffect, useState, type FormEvent } from "react";
import { pb } from "@/lib/pocketbase";
import { Button, Card, Input, Label } from "@/components/panel/ui";
import type { ProductOption } from "@/lib/types";

const emptyForm = { groupName: "", name: "", priceDelta: "" };

export function ProductOptionsEditor({ productId }: { productId: string }) {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [productId]);

  async function load() {
    setLoading(true);
    const list = await pb.collection("product_options").getFullList<ProductOption>({
      filter: pb.filter("product = {:id}", { id: productId }),
      sort: "order,created",
    });
    setOptions(list);
    setLoading(false);
  }

  function startEdit(option: ProductOption) {
    setEditingId(option.id);
    setForm({ groupName: option.group_name, name: option.name, priceDelta: option.price_delta.toString() });
  }

  function startAdd() {
    setEditingId("new");
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        group_name: form.groupName,
        name: form.name,
        price_delta: Number(form.priceDelta) || 0,
      };
      if (editingId && editingId !== "new") {
        await pb.collection("product_options").update(editingId, payload);
      } else {
        await pb.collection("product_options").create({ ...payload, product: productId, order: options.length });
      }
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu seçeneği silmek istediğine emin misin?")) return;
    await pb.collection("product_options").delete(id);
    await load();
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Seçenekler / Varyantlar</p>
          <p className="mt-1 text-xs text-ink-soft">Boy, ekstra malzeme gibi fiyat farkı yaratan opsiyonlar.</p>
        </div>
        {editingId === null && (
          <Button type="button" variant="outline" onClick={startAdd}>
            + Ekle
          </Button>
        )}
      </div>

      {loading && <p className="text-sm text-ink-soft">Yükleniyor…</p>}

      {!loading && options.length === 0 && editingId === null && (
        <p className="text-sm text-ink-soft">Henüz seçenek eklenmedi. Örn: &quot;Boy&quot; grubunda &quot;Büyük +25₺&quot;.</p>
      )}

      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-2.5 text-sm">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">{opt.group_name}</span>
              <p className="font-medium">
                {opt.name}{" "}
                <span className="text-ink-soft">
                  {opt.price_delta >= 0 ? "+" : ""}
                  {opt.price_delta}₺
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => startEdit(opt)} className="text-xs text-ink-soft hover:text-paprika">
                Düzenle
              </button>
              <button type="button" onClick={() => handleDelete(opt.id)} className="text-xs text-ink-soft hover:text-paprika">
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId !== null && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-line bg-crema/30 p-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="opt-group">Grup</Label>
              <Input
                id="opt-group"
                required
                placeholder="Boy"
                value={form.groupName}
                onChange={(e) => setForm({ ...form, groupName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="opt-name">Seçenek</Label>
              <Input
                id="opt-name"
                required
                placeholder="Büyük"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="opt-price">Fiyat farkı (₺)</Label>
              <Input
                id="opt-price"
                type="number"
                step="0.01"
                placeholder="25"
                value={form.priceDelta}
                onChange={(e) => setForm({ ...form, priceDelta: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>
              Kaydet
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
              Vazgeç
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
