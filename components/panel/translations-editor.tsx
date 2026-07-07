"use client";

import { useState } from "react";
import { localeCodes, localeLabels, NON_DEFAULT_LOCALES, type Locale, type TranslatableField, type Translations } from "@/lib/i18n";
import { Input, Label, Textarea } from "@/components/panel/ui";

// Kategori/ürün adı ve açıklaması için EN/AR/RU çevirilerini düzenleme alanı.
// Boş bırakılan alanlar müşteri menüsünde otomatik olarak Türkçe'ye düşer.
export function TranslationsEditor({
  value,
  onChange,
  fields,
}: {
  value: Translations;
  onChange: (next: Translations) => void;
  fields: { key: TranslatableField; label: string; multiline?: boolean }[];
}) {
  const [tab, setTab] = useState<Locale>(NON_DEFAULT_LOCALES[0]);

  function setField(locale: Locale, field: TranslatableField, text: string) {
    onChange({ ...value, [locale]: { ...value[locale], [field]: text } });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {NON_DEFAULT_LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setTab(l)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              tab === l ? "border-paprika bg-paprika text-paper" : "border-line text-ink-soft hover:border-paprika hover:text-paprika"
            }`}
          >
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider">{localeCodes[l]}</span>
            {localeLabels[l]}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <Label htmlFor={`translation-${tab}-${f.key}`}>{f.label}</Label>
            {f.multiline ? (
              <Textarea
                id={`translation-${tab}-${f.key}`}
                rows={2}
                value={value[tab]?.[f.key] ?? ""}
                onChange={(e) => setField(tab, f.key, e.target.value)}
              />
            ) : (
              <Input
                id={`translation-${tab}-${f.key}`}
                value={value[tab]?.[f.key] ?? ""}
                onChange={(e) => setField(tab, f.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
