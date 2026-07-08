"use client";

import Link from "next/link";
import { useMenu } from "@/components/menu/menu-provider";
import { ArrowLeftIcon } from "@/components/icons";

export function CategoryTabs({ activeId }: { activeId?: string }) {
  const { base, categories, t, tf } = useMenu();

  if (categories.length === 0) return null;

  return (
    <div className="sticky top-[var(--header-h)] z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {activeId && (
          <Link
            href={`${base}/menu`}
            replace
            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-crema px-3 py-2 font-mono text-[12px] uppercase tracking-wider text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeftIcon size={14} />
            {t("categoriesLabel")}
          </Link>
        )}
        {categories.map((cat) => {
          const active = cat.id === activeId;
          return (
            <Link
              key={cat.id}
              href={`${base}/categories/${cat.id}`}
              replace
              className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-2 font-mono text-[12px] uppercase tracking-wider transition-colors ${
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
  );
}
