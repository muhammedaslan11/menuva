"use client";

import { useEffect, useState, type DragEvent } from "react";
import Link from "next/link";
import { pb } from "@/lib/pocketbase";
import { useBusiness } from "@/components/panel/business-context";
import { Button, Card, EmptyState, PageHeader } from "@/components/panel/ui";
import { GripIcon } from "@/components/icons";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const { business, isLoading: businessLoading } = useBusiness();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!business) return;
    load();
  }, [business]);

  async function load() {
    if (!business) return;
    setLoading(true);
    const list = await pb.collection("categories").getFullList<Category>({
      filter: pb.filter("business = {:id}", { id: business.id }),
      sort: "order,created",
    });
    setCategories(list);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kategoriyi ve içindeki tüm ürünleri silmek istediğine emin misin?")) return;
    await pb.collection("categories").delete(id);
    await load();
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (index !== overIndex) setOverIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  async function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      handleDragEnd();
      return;
    }
    const next = [...categories];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setCategories(next);
    handleDragEnd();
    await Promise.all(next.map((c, i) => pb.collection("categories").update(c.id, { order: i })));
  }

  if (businessLoading || loading) {
    return <p className="text-ink-soft">Yükleniyor…</p>;
  }

  return (
    <div>
      <PageHeader
        title="Kategoriler"
        description="Menünü bölümlere ayır: Kahvaltı, Ana Yemek, Tatlılar… Sırayı değiştirmek için tutup sürükle."
        action={
          <Link href="/panel/categories/new">
            <Button>+ Yeni kategori</Button>
          </Link>
        }
      />

      {categories.length === 0 && (
        <EmptyState
          title="Henüz kategori yok"
          description="İlk kategorini oluşturarak menünü kurmaya başla."
          action={
            <Link href="/panel/categories/new">
              <Button>+ Yeni kategori</Button>
            </Link>
          }
        />
      )}

      <div className="space-y-3">
        {categories.map((cat, i) => (
          <Card
            key={cat.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
            className={`flex items-center justify-between gap-4 transition-colors ${
              dragIndex === i ? "opacity-40" : ""
            } ${overIndex === i && dragIndex !== null && dragIndex !== i ? "border-paprika" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span
                className="cursor-grab text-ink-soft/60 transition-colors hover:text-ink-soft active:cursor-grabbing"
                aria-hidden="true"
              >
                <GripIcon size={20} />
              </span>
              <div>
                <p className="font-display text-lg font-bold">
                  {cat.name}
                  {!cat.is_active && (
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                      (gizli)
                    </span>
                  )}
                </p>
                {cat.description && <p className="text-sm text-ink-soft">{cat.description}</p>}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link href={`/panel/category/${cat.id}`}>
                <Button variant="outline">Düzenle</Button>
              </Link>
              <Button variant="danger" onClick={() => handleDelete(cat.id)}>
                Sil
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
