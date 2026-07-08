"use client";

import Link from "next/link";
import { useMenu } from "@/components/menu/menu-provider";
import { CategoryTabs } from "@/components/menu/category-tabs";
import { ArrowLeftIcon } from "@/components/icons";

export default function MenuCategoriesPage() {
  const { base, categories, categoriesLoading, imageByCategory, productCountByCategory, t, tf } = useMenu();

  if (categoriesLoading) {
    return <p className="py-20 text-center text-ink-soft">{t("loading")}</p>;
  }

  if (categories.length === 0) {
    return <p className="py-20 text-center text-ink-soft">{t("menuPreparing")}</p>;
  }

  return (
    <div>
      <CategoryTabs />
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        {categories.map((cat) => {
          const image = imageByCategory.get(cat.id);
          const count = productCountByCategory.get(cat.id) ?? 0;
          const name = tf(cat, "name");
          return (
            <Link
              key={cat.id}
              href={`${base}/categories/${cat.id}`}
              data-reveal
              className="group flex flex-col overflow-hidden rounded-xl border border-line bg-paper transition-colors hover:border-[var(--brand)]"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-crema">
                {image ? (
                  <picture>
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </picture>
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center font-display text-2xl font-extrabold"
                    style={{ color: "var(--brand-text)" }}
                  >
                    {name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold leading-tight">{name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-soft">{t("productCount", { count })}</p>
                </div>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crema"
                  style={{ color: "var(--brand-text)" }}
                >
                  <ArrowLeftIcon size={14} className="rotate-180" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
