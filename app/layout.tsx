import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "@fontsource-variable/jetbrains-mono";
// Menü uygulamasında işletme bazında seçilebilen fontlar (lib/fonts.ts).
import "@fontsource-variable/inter";
import "@fontsource-variable/nunito";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/lora";
import "@fontsource-variable/playfair-display";
import "./globals.css";
import { AuthProvider } from "@/lib/use-auth";
import { ScrollReveal } from "@/components/scroll-reveal";

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
        <ScrollReveal />
        <Analytics />
      </body>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-85G8D20Q8V" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-85G8D20Q8V');`}
      </Script>
    </html>
  );
}
