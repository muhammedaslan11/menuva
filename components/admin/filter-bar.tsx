"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { Input, Select } from "@/components/admin/ui";
import { SearchIcon } from "@/components/icons";

export interface FilterSelectConfig {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

// Liste sayfalarında (Kullanıcılar/Destek/Loglar) arama + filtre çubuğu.
// Sonuçlar Server Component'te searchParams'tan okunuyor; bu bileşen sadece
// URL'i günceller (router.push), veri çekimine karışmaz.
export function AdminFilterBar({
  basePath,
  searchParams,
  searchPlaceholder = "Ara…",
  searchName = "q",
  selects = [],
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  searchPlaceholder?: string;
  searchName?: string;
  selects?: FilterSelectConfig[];
}) {
  const router = useRouter();

  function buildParams(overrides: Record<string, string | undefined>) {
    const merged = { ...searchParams, ...overrides };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    // Filtre değişince ilk sayfaya dön — eski sayfa numarası artık anlamsız olabilir.
    params.delete("page");
    return params;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = String(formData.get(searchName) ?? "");
    router.push(`${basePath}?${buildParams({ [searchName]: q }).toString()}`);
  }

  function handleSelectChange(name: string, e: ChangeEvent<HTMLSelectElement>) {
    router.push(`${basePath}?${buildParams({ [name]: e.target.value }).toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
        />
        <Input
          name={searchName}
          defaultValue={searchParams[searchName] ?? ""}
          placeholder={searchPlaceholder}
          className="pl-10"
        />
      </div>
      {selects.map((s) => (
        <Select
          key={s.name}
          defaultValue={searchParams[s.name] ?? ""}
          onChange={(e) => handleSelectChange(s.name, e)}
          className="w-auto shrink-0"
        >
          <option value="">{s.label}</option>
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      ))}
    </form>
  );
}
