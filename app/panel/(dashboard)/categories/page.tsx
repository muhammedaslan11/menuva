"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pb } from "@/lib/pocketbase";
import { useBusiness } from "@/components/panel/business-context";
import { Button, Card, EmptyState, PageHeader } from "@/components/panel/ui";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const { business, isLoading: businessLoading } = useBusiness();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    await Promise.all(next.map((c, i) => pb.collection("categories").update(c.id, { order: i })));
  }

  if (businessLoading || loading) {
    return <p className="text-ink-soft">Yükleniyor…</p>;
  }

  return (
    <div>
      <PageHeader
        title="Kategoriler"
        description="Menünü bölümlere ayır: Kahvaltı, Ana Yemek, Tatlılar…"
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
          <Card key={cat.id} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <button
                  aria-label="Yukarı taşı"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-ink-soft hover:text-paprika disabled:opacity-20"
                >
                  ▲
                </button>
                <button
                  aria-label="Aşağı taşı"
                  onClick={() => move(i, 1)}
                  disabled={i === categories.length - 1}
                  className="text-ink-soft hover:text-paprika disabled:opacity-20"
                >
                  ▼
                </button>
              </div>
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
