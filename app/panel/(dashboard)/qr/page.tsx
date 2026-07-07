"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useBusiness } from "@/components/panel/business-context";
import { menuUrl as buildMenuUrl } from "@/lib/site";
import { Button, Card, PageHeader } from "@/components/panel/ui";

export default function QrPage() {
  const { business, isLoading } = useBusiness();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [menuUrl, setMenuUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!business) return;
    const url = buildMenuUrl(business.slug);
    setMenuUrl(url);
    QRCode.toDataURL(url, {
      width: 640,
      margin: 2,
      color: { dark: "#231812", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [business]);

  async function handleCopy() {
    await navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (isLoading || !business) {
    return <p className="text-ink-soft">Yükleniyor…</p>;
  }

  return (
    <div>
      <PageHeader title="QR kod ve paylaşım" description="Masalara, vitrine ya da sosyal medyaya koy." />
      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Card className="flex items-center justify-center">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="Menü QR kodu" className="h-56 w-56" />
          ) : (
            <div className="h-56 w-56 animate-pulse rounded-xl bg-crema" />
          )}
        </Card>
        <Card className="flex flex-col justify-center gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Menü adresin</p>
            <a
              href={menuUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all font-display text-lg font-bold text-paprika hover:underline"
            >
              {menuUrl}
            </a>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleCopy}>
              {copied ? "Kopyalandı ✓" : "Linki kopyala"}
            </Button>
            {qrDataUrl && (
              <a href={qrDataUrl} download={`${business.slug}-qr.png`}>
                <Button type="button" variant="outline">
                  QR indir (PNG)
                </Button>
              </a>
            )}
          </div>
          <p className="text-sm text-ink-soft">
            QR kodu indirip masalara, vitrine ya da paket servis poşetlerine bastırabilirsin. Menünde yaptığın her
            değişiklik anında bu adreste görünür — QR&apos;ı yeniden basmana gerek yok.
          </p>
        </Card>
      </div>
    </div>
  );
}
