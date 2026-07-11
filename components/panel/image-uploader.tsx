"use client";

import { useState } from "react";
import { uploadFile, type UploadKind } from "@/lib/upload";
import { Spinner } from "@/components/panel/ui";

// Tek görsel yükleyici — her yerde resim tekildir, çoklu ekleme yoktur.
// Yükleme sırasında loader gösterir; hazır görselin üstünde "değiştir"/"kaldır" sunar.
export function ImageUploader({
  value,
  onChange,
  businessId,
  kind,
  aspect = "aspect-square",
  className = "",
}: {
  value: string;
  onChange: (url: string) => void;
  businessId: string;
  kind: UploadKind;
  aspect?: string;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError(false);
    try {
      const url = await uploadFile(file, businessId, kind);
      onChange(url);
    } catch {
      setError(true);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className={`relative w-full overflow-hidden rounded-2xl border border-dashed border-line bg-crema/30 ${aspect} ${className}`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-soft">Görsel yok</div>
        )}

        {/* Yükleme loader'ı */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <Spinner className="h-7 w-7 text-paper" />
          </div>
        )}

        {/* Tıklanınca dosya seçtiren katman */}
        {!uploading && (
          <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-ink/0 text-transparent transition-colors hover:bg-ink/40 hover:text-paper">
            <span className="font-mono text-[11px] uppercase tracking-wider">{value ? "Değiştir" : "Görsel yükle"}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(e) => handleFile(e.target.files)}
            />
          </label>
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between">
        {error ? (
          <span className="text-xs text-paprika-deep">Yüklenemedi, tekrar dene.</span>
        ) : (
          <span />
        )}
        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="font-mono text-[11px] uppercase tracking-wider text-ink-soft transition-colors hover:text-paprika"
          >
            Kaldır
          </button>
        )}
      </div>
    </div>
  );
}
