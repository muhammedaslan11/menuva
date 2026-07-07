"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/chrome";
import { useAuth } from "@/lib/use-auth";
import { pb } from "@/lib/pocketbase";
import { BusinessProvider, useBusiness } from "@/components/panel/business-context";
import { menuUrl } from "@/lib/site";

const navItems = [
  { href: "/panel", label: "Genel bakış", prefixes: ["/panel"] },
  { href: "/panel/categories", label: "Kategoriler", prefixes: ["/panel/categories", "/panel/category/"] },
  { href: "/panel/products", label: "Ürünler", prefixes: ["/panel/products", "/panel/product/"] },
  { href: "/panel/popups", label: "Duyurular", prefixes: ["/panel/popups", "/panel/popup/"] },
  { href: "/panel/reviews", label: "Değerlendirmeler", prefixes: ["/panel/reviews"] },
  { href: "/panel/qr", label: "QR & paylaş", prefixes: ["/panel/qr"] },
  { href: "/panel/settings", label: "Ayarlar", prefixes: ["/panel/settings"] },
];

function isNavItemActive(pathname: string, item: (typeof navItems)[number]) {
  if (item.href === "/panel") return pathname === "/panel";
  return item.prefixes.some((prefix) => pathname.startsWith(prefix));
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { business, isLoading } = useBusiness();

  function handleLogout() {
    pb.authStore.clear();
    router.replace("/panel/login");
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-ink-soft">Yükleniyor…</div>;
  }

  return (
    <div className="min-h-screen bg-crema/30">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/panel">
            <Logo />
          </Link>
          {business && (
            <nav className="hidden items-center gap-6 font-mono text-[12px] uppercase tracking-wider text-ink-soft md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors hover:text-paprika ${
                    isNavItemActive(pathname, item) ? "text-paprika" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-4">
            {business && (
              <a
                href={menuUrl(business.slug)}
                target="_blank"
                rel="noreferrer"
                className="hidden font-mono text-[12px] uppercase tracking-wider text-herb hover:underline sm:inline"
              >
                Menüyü gör ↗
              </a>
            )}
            <button
              onClick={handleLogout}
              className="font-mono text-[12px] uppercase tracking-wider text-ink-soft transition-colors hover:text-paprika"
            >
              Çıkış
            </button>
          </div>
        </div>
        {business && (
          <div className="border-t border-line/60 md:hidden">
            <nav className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap transition-colors hover:text-paprika ${
                    isNavItemActive(pathname, item) ? "text-paprika" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/panel/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-ink-soft">Yükleniyor…</div>;
  }

  return (
    <BusinessProvider>
      <DashboardShell>{children}</DashboardShell>
    </BusinessProvider>
  );
}
