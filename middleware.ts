import { NextResponse, type NextRequest } from "next/server";
import { RESERVED_SLUGS } from "@/lib/slug";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "menuva.app";

// Subdomain tabanlı menü adresleri: vezirhan.menuva.app -> içeride /vezirhan/... rotaları.
// Kök alan adı (menuva.app, www, localhost, vercel preview) olduğu gibi geçer;
// landing sayfası ve /panel oralarda yaşamaya devam eder.
function getSubdomain(hostname: string): string | null {
  if (hostname === "localhost" || hostname === "127.0.0.1") return null;
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    return sub === "www" ? null : sub;
  }
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return null;
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
    return sub === "www" ? null : sub;
  }
  // Bilinmeyen host (vercel.app preview'ları vb.) kök gibi davranır.
  return null;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const hostname = host.split(":")[0];
  const sub = getSubdomain(hostname);
  if (!sub) return NextResponse.next();

  const url = req.nextUrl.clone();
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  const rootHost = `${hostname.endsWith(".localhost") ? "localhost" : ROOT_DOMAIN}${port}`;

  // Rezerve subdomain'ler (panel, api, www benzeri) işletme adresi değildir;
  // kök alan adına gönder. panel/admin/app doğrudan panele düşsün.
  if (RESERVED_SLUGS.has(sub)) {
    url.host = rootHost;
    if (sub === "panel" || sub === "admin" || sub === "app") {
      url.pathname = url.pathname === "/" ? "/panel" : `/panel${url.pathname}`;
    }
    return NextResponse.redirect(url);
  }

  // Panel subdomain'de yaşamaz; kök alan adına gönder.
  if (url.pathname === "/panel" || url.pathname.startsWith("/panel/")) {
    url.host = rootHost;
    return NextResponse.redirect(url);
  }

  url.pathname = url.pathname === "/" ? `/${sub}/welcome` : `/${sub}${url.pathname}`;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-menuva-rewrite", "subdomain");
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  // Statik dosyalar, Next iç yolları ve API hariç her şey.
  matcher: ["/((?!api/|_next/|.*\\.).*)"],
};
