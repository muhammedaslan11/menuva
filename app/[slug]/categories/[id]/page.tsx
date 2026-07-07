"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { useMenu } from "@/components/menu/menu-provider";
import { ProductCard } from "@/components/menu/product-card";
import type { Category, Product } from "@/lib/types";

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { business, base, addProduct, track, t, tf } = useMenu();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      pb.collection("categories").getFullList<Category>({
        filter: pb.filter("business = {:id} && is_active = true", { id: business.id }),
        requestKey: null,
        sort: "order,created",
      }),
      pb.collection("products").getFullList<Product>({
        filter: pb.filter("business = {:b} && category = {:c} && is_available = true", { b: business.id, c: id }),
        requestKey: null,
        sort: "order,created",
      }),
    ]).then(([cats, prods]) => {
      if (cancelled) return;
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
      const current = cats.find((c) => c.id === id);
      if (current) track("category_view", current.id, current.name);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.id, id]);

  const current = categories.find((c) => c.id === id);

  return (
    <div className="pb-6">
      {/* Yatay kategori pill'leri */}
      {categories.length > 0 && (
        <div className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {categories.map((cat) => {
              const active = cat.id === id;
              return (
                <Link
                  key={cat.id}
                  href={`${base}/categories/${cat.id}`}
                  replace
                  className={`whitespace-nowrap rounded-xl px-4 py-2 font-mono text-[12px] uppercase tracking-wider transition-colors ${
                    active ? "" : "bg-crema text-ink-soft hover:text-ink"
                  }`}
                  style={active ? { background: "var(--brand)", color: "var(--brand-on)" } : undefined}
                >
                  {tf(cat, "name")}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Kategori başlığı */}
      {current && (
        <div className="px-4 pt-5">
          <h1 className="font-display text-2xl font-extrabold italic tracking-tight" style={{ color: "var(--brand-text)" }}>
            {tf(current, "name")}
          </h1>
          {tf(current, "description") && <p className="mt-1 text-sm text-ink-soft">{tf(current, "description")}</p>}
          <div className="mt-2 h-0.5 w-full rounded" style={{ background: "var(--brand)" }} />
        </div>
      )}

      {/* Ürünler */}
      <div className="px-4 pt-4">
        {loading ? (
          <p className="py-16 text-center text-ink-soft">{t("loading")}</p>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-ink-soft">{t("noProductsInCategory")}</p>
        ) : (
          <div className={business.template === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                template={business.template}
                onAdd={addProduct}
                onOpen={() => router.push(`${base}/products/${product.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
