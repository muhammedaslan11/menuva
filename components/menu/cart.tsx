"use client";

import type { CartLine } from "@/lib/cart";
import { cartCount, cartTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useMenu } from "@/components/menu/menu-provider";

export function CartBar({ lines, onOpen }: { lines: CartLine[]; onOpen: () => void }) {
  const { t } = useMenu();
  const count = cartCount(lines);
  if (count === 0) return null;
  return (
    <button
      onClick={onOpen}
      style={{ background: "var(--brand)", color: "var(--brand-on)" }}
      className="fixed inset-x-4 bottom-20 z-40 flex items-center justify-between rounded-2xl px-5 py-4 shadow-[0_20px_40px_-12px_rgba(35,24,18,0.5)] sm:inset-x-auto sm:end-6 sm:w-96"
    >
      <span className="font-mono text-[13px] uppercase tracking-wider">{t("cartBarLabel", { count })}</span>
      <span className="font-mono text-base font-bold">{formatPrice(cartTotal(lines))}</span>
    </button>
  );
}

export function CartDrawer({
  lines,
  onClose,
  onUpdateQuantity,
  onRemove,
}: {
  lines: CartLine[];
  onClose: () => void;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
}) {
  const { t } = useMenu();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-5" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-paper p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{t("cartTitle")}</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-[var(--brand-text)]" aria-label={t("close")}>
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <p className="mt-6 text-sm text-ink-soft">{t("cartEmpty")}</p>
        ) : (
          <div className="mt-5 space-y-4">
            {lines.map((line) => (
              <div key={line.key} className="flex items-start justify-between gap-3 border-b border-line pb-4">
                <div>
                  <p className="font-medium">{line.name}</p>
                  {line.selections.length > 0 && (
                    <p className="text-xs text-ink-soft">{line.selections.map((s) => s.name).join(", ")}</p>
                  )}
                  <div className="mt-2 flex w-fit items-center gap-2 rounded-full border border-line px-2.5 py-1">
                    <button onClick={() => onUpdateQuantity(line.key, line.quantity - 1)} className="text-sm" aria-label={t("decrease")}>
                      −
                    </button>
                    <span className="w-4 text-center font-mono text-xs">{line.quantity}</span>
                    <button onClick={() => onUpdateQuantity(line.key, line.quantity + 1)} className="text-sm" aria-label={t("increase")}>
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium">{formatPrice(line.unitPrice * line.quantity)}</p>
                  <button onClick={() => onRemove(line.key)} className="mt-2 text-xs text-ink-soft hover:text-[var(--brand-text)]">
                    {t("remove")}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-sm uppercase tracking-wider text-ink-soft">{t("total")}</span>
              <span className="font-display text-xl font-bold">{formatPrice(cartTotal(lines))}</span>
            </div>
            <p className="text-center text-xs text-ink-soft">{t("showToWaiter")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
