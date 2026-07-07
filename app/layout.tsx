import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { AuthProvider } from "@/lib/use-auth";

export const metadata: Metadata = {
  title: "menuva — Dijital QR Menü",
  description:
    "Menünüzü dakikalar içinde dijitalleştirin. Fiyat güncelleyin, kampanya ekleyin, QR kodla paylaşın. Baskı yok, bekleme yok.",
  keywords: ["qr menü", "dijital menü", "restoran menü", "kafe menü", "online menü"],
  openGraph: {
    title: "menuva — Dijital QR Menü",
    description: "Kâğıt menü devri kapandı. Menünüz artık her masada güncel.",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
