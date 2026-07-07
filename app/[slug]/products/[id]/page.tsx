"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { useMenu } from "@/components/menu/menu-provider";
import { allergenLabels, badgeLabels } from "@/lib/labels";
import { formatPrice } from "@/lib/format";
import { BadgeIcon, ClockIcon, FlameIcon } from "@/components/icons";
import type { Product, ProductOption } from "@/lib/types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { business, base, addProduct, track, locale, t, tf } = useMenu();
  const [product, setProduct] = useState<Product | null>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      pb.collection("products").getOne<Product>(id, { requestKey: null }),
      pb.collection("product_options").getFullList<ProductOption>({
        filter: pb.filter("product = {:id}", { id }),
        requestKey: null,
        sort: "order,created",
      }),
    ])
      .then(([prod, opts]) => {
        if (cancelled) return;
        setProduct(prod);
        setOptions(opts);
        setLoading(false);
        track("product_view", prod.id, prod.name);
      })
      .catch(() => {
        if (!cancelled) router.replace(`${base}/menu`);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, base, router]);

  if (loading || !product) {
    return <p className="py-20 text-center text-ink-soft">{t("loading")}</p>;
  }

  const hasDiscount = product.discount_percent > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount_percent / 100) : product.price;
  const image = product.images?.[0];
  const name = tf(product, "name");
  const description = tf(product, "description");

  const optionGroups = new Map<string, ProductOption[]>();
  for (const opt of options) {
    const list = optionGroups.get(opt.group_name) ?? [];
    list.push(opt);
    optionGroups.set(opt.group_name, list);
  }

  return (
    <div className="pb-10">
      {image && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-crema sm:aspect-[2/1]">
          <Image src={image} alt={name} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        </div>
      )}

      <div className="space-y-4 px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-extrabold leading-tight">{name}</h1>
          <div className="shrink-0 text-right">
            {hasDiscount && <p className="font-mono text-sm text-ink-soft line-through">{formatPrice(product.price)}</p>}
            <p className="font-mono text-xl font-bold" style={{ color: "var(--brand-text)" }}>
              {formatPrice(finalPrice)}
            </p>
          </div>
        </div>

        {(product.badges?.length > 0 || product.campaign_label) && (
          <div className="flex flex-wrap gap-1.5">
            {product.badges?.map((b) => (
              <span
                key={b}
                className="flex items-center gap-1.5 rounded-full bg-crema px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft"
              >
                <BadgeIcon badge={b} size={13} strokeWidth={2.2} />
                {badgeLabels[locale][b]}
              </span>
            ))}
            {product.campaign_label && (
              <span className="rounded-full bg-herb/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-herb">
                {product.campaign_label}
              </span>
            )}
          </div>
        )}

        {description && <p className="text-sm leading-relaxed text-ink-soft">{description}</p>}

        {(product.prep_time_min > 0 || product.calories > 0) && (
          <div className="flex flex-wrap gap-4 font-mono text-[12px] text-ink-soft">
            {product.prep_time_min > 0 && (
              <span className="flex items-center gap-1.5">
                <ClockIcon size={14} />
                {product.prep_time_min}
                {product.prep_time_max > product.prep_time_min ? `-${product.prep_time_max}` : ""} {t("minUnit")}
              </span>
            )}
            {product.calories > 0 && (
              <span className="flex items-center gap-1.5">
                <FlameIcon size={14} />
                {product.calories} kcal
              </span>
            )}
          </div>
        )}

        {product.allergens?.length > 0 && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{t("allergensLabel")}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {product.allergens.map((a) => (
                <span key={a} className="rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-soft">
                  {allergenLabels[locale][a]}
                </span>
              ))}
            </div>
          </div>
        )}

        {optionGroups.size > 0 && (
          <div className="space-y-3">
            {Array.from(optionGroups.entries()).map(([groupName, groupOptions]) => (
              <div key={groupName} className="rounded-2xl border border-line p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{groupName}</p>
                <div className="mt-2 space-y-1.5">
                  {groupOptions.map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between text-sm">
                      <span>{opt.name}</span>
                      <span className="font-mono text-ink-soft">
                        {opt.price_delta >= 0 ? "+" : ""}
                        {formatPrice(opt.price_delta)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => addProduct(product)}
          className="w-full rounded-2xl py-4 font-display text-lg font-bold shadow-lg transition-opacity hover:opacity-90"
          style={{ background: "var(--brand)", color: "var(--brand-on)" }}
        >
          + {t("addToCart")} · {formatPrice(finalPrice)}
        </button>
      </div>
    </div>
  );
}
