"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/chrome";
import type { AdminRole } from "@/lib/admin/auth";
import { adminLogoutAction } from "@/app/admin/(dashboard)/actions";
import {
  BellIcon,
  FileTextIcon,
  LayoutIcon,
  LifeBuoyIcon,
  LogoutIcon,
  TagIcon,
  UsersIcon,
} from "@/components/icons";

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

interface NavItem {
  href: string;
  label: string;
  Icon: typeof LayoutIcon;
  exact?: boolean;
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Genel bakış", Icon: LayoutIcon, exact: true },
  { href: "/admin/users", label: "Kullanıcılar", Icon: UsersIcon },
  { href: "/admin/tickets", label: "Destek", Icon: LifeBuoyIcon },
  { href: "/admin/notifications", label: "Bildirimler", Icon: BellIcon },
  { href: "/admin/plans", label: "Planlar", Icon: TagIcon, superAdminOnly: true },
  { href: "/admin/logs", label: "Loglar", Icon: FileTextIcon, superAdminOnly: true },
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const roleLabels: Record<AdminRole, string> = {
  super_admin: "Süper Admin",
  support: "Destek",
};

export function AdminShell({ admin, children }: { admin: AdminInfo; children: React.ReactNode }) {
  const pathname = usePathname();
  const items = navItems.filter((item) => !item.superAdminOnly || admin.role === "super_admin");

  return (
    <div className="min-h-screen bg-crema/30 text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/admin">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-ink">{admin.name}</p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{roleLabels[admin.role]}</p>
            </div>
            <form action={adminLogoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 font-mono text-[12px] uppercase tracking-wider text-ink transition-colors hover:border-paprika hover:text-paprika"
              >
                <LogoutIcon size={15} strokeWidth={2} />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </form>
          </div>
        </div>
        {/* Mobil: yatay kaydırılabilir kompakt menü (sidebar masaüstünde) */}
        <div className="border-t border-line/60 md:hidden">
          <nav className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap transition-colors hover:text-paprika ${
                  isActive(pathname, item) ? "text-paprika" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-8 px-5">
        {/* Masaüstü: sol sidebar */}
        <aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-52 shrink-0 overflow-y-auto py-8 md:block">
          <nav className="space-y-1">
            {items.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-paprika/10 font-semibold text-paprika"
                      : "text-ink-soft hover:bg-crema/70 hover:text-ink"
                  }`}
                >
                  <item.Icon size={17} strokeWidth={active ? 2.1 : 1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 py-10">{children}</main>
      </div>
    </div>
  );
}
