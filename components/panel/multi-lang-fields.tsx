"use client";

import { useState } from "react";
import { localeLabels, type Locale, type TranslatableField, type Translations } from "@/lib/i18n";
import { Input, Label, Tabs, Textarea } from "@/components/panel/ui";

interface FieldDef {
  key: TranslatableField;
  label: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}

// Çevrilebilir metin alanlarını (ad, açıklama) dil sekmeleriyle düzenler.
// Ana dil her zaman ilk sekmedir ve varsayılan açık gelir; ana dil sekmesi
// varlığın baz alanlarını, diğer sekmeler `translations` içindeki çevirileri
// düzenler. Boş bırakılan çeviriler müşteri menüsünde ana dile düşer.
export function MultiLangFields({
  locales,
  mainLocale,
  base,
  onBaseChange,
  translations,
  onTranslationsChange,
  fields,
}: {
  /** Aktif diller, ana dil ilk sırada. */
  locales: Locale[];
  mainLocale: Locale;
  /** Baz (ana dil) alan değerleri. */
  base: Partial<Record<TranslatableField, string>>;
  onBaseChange: (field: TranslatableField, value: string) => void;
  translations: Translations;
  onTranslationsChange: (next: Translations) => void;
  fields: FieldDef[];
}) {
  const [tab, setTab] = useState<Locale>(mainLocale);
  const active = locales.includes(tab) ? tab : mainLocale;
  const isMain = active === mainLocale;

  function setTranslation(locale: Locale, field: TranslatableField, value: string) {
    onTranslationsChange({ ...translations, [locale]: { ...translations[locale], [field]: value } });
  }

  const tabItems = locales.map((l) => ({
    key: l,
    label: l === mainLocale ? `${localeLabels[l]} · Ana` : localeLabels[l],
  }));

  return (
    <div>
      <Tabs tabs={tabItems} active={active} onChange={setTab} />
      <div className="space-y-4">
        {fields.map((f) => {
          const value = isMain ? base[f.key] ?? "" : translations[active]?.[f.key] ?? "";
          const onChange = (v: string) => (isMain ? onBaseChange(f.key, v) : setTranslation(active, f.key, v));
          const id = `mlf-${active}-${f.key}`;
          return (
            <div key={f.key}>
              <Label htmlFor={id}>{f.label}</Label>
              {f.multiline ? (
                <Textarea
                  id={id}
                  rows={f.rows ?? 2}
                  value={value}
                  placeholder={f.placeholder}
                  onChange={(e) => onChange(e.target.value)}
                />
              ) : (
                <Input
                  id={id}
                  value={value}
                  placeholder={f.placeholder}
                  required={f.required && isMain}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            </div>
          );
        })}
        {!isMain && (
          <p className="text-xs text-ink-soft">Boş bırakılırsa {localeLabels[mainLocale]} (ana dil) gösterilir.</p>
        )}
      </div>
    </div>
  );
}
