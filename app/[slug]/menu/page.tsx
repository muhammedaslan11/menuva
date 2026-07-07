"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { pb } from "@/lib/pocketbase";
import { useMenu } from "@/components/menu/menu-provider";
import type { Category, Product } from "@/lib/types";

export default function MenuCategoriesPage() {
  const { business, base, t, tf } = useMenu();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      pb.collection("categories").getFullList<Category>({
        filter: pb.filter("business = {:id} && is_active = true", { id: business.id }),
        requestKey: null,
        sort: "order,created",
      }),
      pb.collection("products").getFullList<Product>({
        filter: pb.filter("business = {:id} && is_available = true", { id: business.id }),
        requestKey: null,
        sort: "order,created",
      }),
    ]).then(([cats, prods]) => {
      if (cancelled) return;
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [business.id]);

  // Kategori kartının görseli: o kategorideki ilk görselli ürünün fotoğrafı.
  const imageByCategory = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (!map.has(p.category) && p.images?.[0]) map.set(p.category, p.images[0]);
    }
    return map;
  }, [products]);

  if (loading) {
    return <p className="py-20 text-center text-ink-soft">{t("loading")}</p>;
  }

  if (categories.length === 0) {
    return <p className="py-20 text-center text-ink-soft">{t("menuPreparing")}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {categories.map((cat) => {
        const image = imageByCategory.get(cat.id);
        const name = tf(cat, "name");
        return (
          <Link
            key={cat.id}
            href={`${base}/categories/${cat.id}`}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-line"
          >
            {image ? (
              <>
                <Image
                  src={image}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 50vw, 300px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent pt-10" />
                <span className="absolute inset-x-0 bottom-0 p-3 font-display text-lg font-bold leading-tight text-paper">
                  {name}
                </span>
              </>
            ) : (
              <span
                className="flex h-full w-full items-center justify-center p-3 text-center font-display text-lg font-bold leading-tight"
                style={{ background: "color-mix(in srgb, var(--brand) 12%, transparent)", color: "var(--brand-text)" }}
              >
                {name}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
