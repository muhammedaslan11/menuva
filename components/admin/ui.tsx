import type { ReactNode } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/panel/ui";

// Admin paneli, işletme panelinin temel form/görsel atomlarını aynen kullanır
// (Label/Input/Textarea/Select/Button/Card/PageHeader/FormActions/Switch/
// ErrorText/EmptyState/Spinner/Tabs — bkz. components/panel/ui.tsx). Burada
// sadece admin'e özgü kompozit bileşenler ekleniyor; ikisi arasında görsel
// dil bilinçli olarak ortak.
export * from "@/components/panel/ui";

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

// Tasarım sistemindeki mevcut semantik renklerle sınırlı (bkz. app/globals.css
// @theme) — buraya yeni bir renk tonu icat edilmiyor.
type BadgeTone = "neutral" | "success" | "warning" | "danger";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-ink/5 text-ink-soft",
  success: "bg-herb/10 text-herb",
  warning: "bg-paprika-deep/10 text-paprika-deep",
  danger: "bg-paprika/10 text-paprika",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

// Salt sunucu bileşeni olarak render edilebilecek şekilde tasarlandı — satır
// tıklama/sıralama gibi etkileşimler yok; gezinme, bir kolonun render()'ında
// döndürülen <Link> ile yapılır (bkz. app/admin/(dashboard)/users/page.tsx).
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyTitle = "Kayıt bulunamadı",
  emptyDescription,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-crema/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-ink-soft ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line/60 last:border-0 hover:bg-crema/20">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 align-middle ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Kontrollü onay diyaloğu (geri alınamaz işlemler için — kullanıcı silme vb.).
// İç state tutmaz; `open`/`onConfirm`/`onCancel` çağıran client component'ten
// gelir (bkz. components/menu/popup-modal.tsx'teki aynı backdrop deseni).
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  danger = true,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-5" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl bg-paper p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <p className="font-display text-lg font-bold">{title}</p>
        {description && <p className="mt-2 text-sm text-ink-soft">{description}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-4 py-2 font-mono text-[12px] uppercase tracking-wider text-ink-soft transition-colors hover:text-ink"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-md px-4 py-2 font-mono text-[12px] uppercase tracking-wider text-paper transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              danger ? "bg-paprika hover:bg-paprika-deep" : "bg-ink hover:bg-paprika"
            }`}
          >
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// URL tabanlı sayfalama (?page=N) — Server Component'ten doğrudan render
// edilebilsin diye state yerine <Link> kullanır.
export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(target));
    return `${basePath}?${params.toString()}`;
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;
  const linkBase =
    "inline-flex items-center rounded-full border border-line px-3.5 py-1.5 font-mono text-[12px] uppercase tracking-wider text-ink transition-colors hover:border-paprika hover:text-paprika";

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span className="text-xs text-ink-soft">
        Sayfa {page} / {totalPages}
      </span>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={prevDisabled}
          className={`${linkBase} ${prevDisabled ? "pointer-events-none opacity-40" : ""}`}
        >
          Önceki
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={nextDisabled}
          className={`${linkBase} ${nextDisabled ? "pointer-events-none opacity-40" : ""}`}
        >
          Sonraki
        </Link>
      </div>
    </div>
  );
}
