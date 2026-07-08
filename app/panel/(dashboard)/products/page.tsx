"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pb } from "@/lib/pocketbase";
import { useBusiness } from "@/components/panel/business-context";
import { Button, Card, EmptyState, PageHeader } from "@/components/panel/ui";
import type { Category, Product } from "@/lib/types";

export default function ProductsPage() {
  const { business, isLoading: businessLoading } = useBusiness();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business) return;
    load();
  }, [business]);

  async function load() {
    if (!business) return;
    setLoading(true);
    const [cats, prods] = await Promise.all([
      pb.collection("categories").getFullList<Category>({
        filter: pb.filter("business = {:id}", { id: business.id }),
        sort: "order,created",
      }),
      pb.collection("products").getFullList<Product>({
        filter: pb.filter("business = {:id}", { id: business.id }),
        sort: "order,created",
      }),
    ]);
    setCategories(cats);
    setProducts(prods);
    setLoading(false);
  }

  async function toggleAvailable(product: Product) {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_available: !p.is_available } : p)));
    await pb.collection("products").update(product.id, { is_available: !product.is_available });
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;
    await pb.collection("products").delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (businessLoading || loading) {
    return <p className="text-ink-soft">Yükleniyor…</p>;
  }

  if (categories.length === 0) {
    return (
      <div>
        <PageHeader title="Ürünler" />
        <EmptyState
          title="Önce bir kategori oluştur"
          description="Ürün eklemeden önce en az bir kategori gerekiyor."
          action={
            <Link href="/panel/categories">
              <Button>Kategori oluştur</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Ürünler"
        description="Fiyat, görsel, rozet ve daha fazlasını yönet."
        action={
          <Link href="/panel/products/new">
            <Button>+ Yeni ürün</Button>
          </Link>
        }
      />

      {products.length === 0 && (
        <EmptyState
          title="Henüz ürün yok"
          description="İlk ürününü ekleyerek menünü canlandır."
          action={
            <Link href="/panel/products/new">
              <Button>+ Yeni ürün</Button>
            </Link>
          }
        />
      )}

      <div className="space-y-10">
        {categories.map((cat) => {
          const items = products.filter((p) => p.category === cat.id);
          if (items.length === 0) return null;
          return (
            <div key={cat.id}>
              <h2 className="mb-3 font-mono text-[13px] uppercase tracking-wider text-ink-soft">{cat.name}</h2>
              <div className="space-y-3">
                {items.map((product) => (
                  <Card key={product.id} className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-crema">
                      {product.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-bold">{product.name}</p>
                      <p className="font-mono text-sm text-ink-soft">
                        {product.price}₺
                        {product.discount_percent > 0 && (
                          <span className="ml-2 text-herb">%{product.discount_percent} indirim</span>
                        )}
                      </p>
                    </div>
                    <label className="flex shrink-0 items-center gap-2 text-xs text-ink-soft">
                      <input type="checkbox" checked={product.is_available} onChange={() => toggleAvailable(product)} />
                      Satışta
                    </label>
                    <div className="flex shrink-0 gap-2">
                      <Link href={`/panel/product/${product.id}`}>
                        <Button variant="outline">Düzenle</Button>
                      </Link>
                      <Button variant="danger" onClick={() => handleDelete(product.id)}>
                        Sil
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
