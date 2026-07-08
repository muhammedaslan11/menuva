"use client";

import type { Product, Template } from "@/lib/types";
import { allergenLabels, badgeLabels } from "@/lib/labels";
import { formatPrice } from "@/lib/format";
import { BadgeIcon, ClockIcon, FlameIcon } from "@/components/icons";
import { useMenu } from "@/components/menu/menu-provider";

export function ProductCard({
  product,
  template,
  onAdd,
  onOpen,
}: {
  product: Product;
  template: Template;
  onAdd: (product: Product) => void;
  onOpen?: () => void;
}) {
  const { locale, t, tf } = useMenu();
  const hasDiscount = product.discount_percent > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount_percent / 100) : product.price;
  const image = product.images?.[0];
  const isGrid = template === "grid";
  const name = tf(product, "name");
  const description = tf(product, "description");

  return (
    <div
      onClick={onOpen}
      data-reveal
      className={`group rounded-xl border border-line bg-paper p-4 transition-colors hover:border-[var(--brand)] ${
        onOpen ? "cursor-pointer " : ""
      }${isGrid ? "flex flex-col" : "flex gap-4"}`}
    >
      {image && (
        <div
          className={
            isGrid
              ? "relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-crema"
              : "relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-crema"
          }
        >
          <picture>
            <img src={image} alt={name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </picture>
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-tight">{name}</h3>
          <div className="shrink-0 text-right">
            {hasDiscount && <p className="font-mono text-xs text-ink-soft line-through">{formatPrice(product.price)}</p>}
            <p className="font-mono text-base font-semibold text-[var(--brand-text)]">{formatPrice(finalPrice)}</p>
          </div>
        </div>

        {(product.badges?.length > 0 || product.campaign_label) && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {product.badges?.map((b) => (
              <span
                key={b}
                className="flex items-center gap-1 rounded-full bg-crema px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-soft"
              >
                <BadgeIcon badge={b} size={11} strokeWidth={2.2} />
                {badgeLabels[locale][b]}
              </span>
            ))}
            {product.campaign_label && (
              <span className="rounded-full bg-herb/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-herb">
                {product.campaign_label}
              </span>
            )}
          </div>
        )}

        {description && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{description}</p>}

        {(product.prep_time_min > 0 || product.calories > 0) && (
          <div className="mt-2 flex flex-wrap gap-3 font-mono text-[11px] text-ink-soft">
            {product.prep_time_min > 0 && (
              <span className="flex items-center gap-1">
                <ClockIcon size={12} />
                {product.prep_time_min}
                {product.prep_time_max > product.prep_time_min ? `-${product.prep_time_max}` : ""} {t("minUnit")}
              </span>
            )}
            {product.calories > 0 && (
              <span className="flex items-center gap-1">
                <FlameIcon size={12} />
                {product.calories} kcal
              </span>
            )}
          </div>
        )}

        {product.allergens?.length > 0 && (
          <p className="mt-1 text-[11px] text-ink-soft">
            {t("allergenPrefix")}: {product.allergens.map((a) => allergenLabels[locale][a]).join(", ")}
          </p>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product);
          }}
          className="mt-3 self-start rounded-full border border-[var(--brand)] px-4 py-1.5 font-mono text-[12px] uppercase tracking-wider text-[var(--brand-text)] transition-colors hover:bg-[var(--brand)] hover:text-[var(--brand-on)]"
        >
          + {t("addToCart")}
        </button>
      </div>
    </div>
  );
}
