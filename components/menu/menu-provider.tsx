"use client";

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { pickReadableOn, readableAccent, visibleFill } from "@/lib/color";
import { getThemeColor } from "@/lib/themes";
import { lineKey, loadCart, saveCart, unitPriceFor, type CartLine, type CartSelection } from "@/lib/cart";
import {
  getStoredLocale,
  isRTLLocale,
  localeCodes,
  localeLabels,
  storeLocale,
  SUPPORTED_LOCALES,
  tField,
  t as translate,
  type Locale,
  type Translatable,
  type TranslatableField,
  type UIKey,
} from "@/lib/i18n";
import type { Business, MenuEventType, Popup, Product, ProductOption } from "@/lib/types";
import { OptionPicker } from "@/components/menu/option-picker";
import { CartBar, CartDrawer } from "@/components/menu/cart";
import { PopupModal } from "@/components/menu/popup-modal";
import { ArrowLeftIcon, MenuIcon, MessageIcon, SearchIcon } from "@/components/icons";

interface MenuContextValue {
  business: Business;
  /** Link tabanı: subdomain'de "" (vezirhan.menuva.app/menu), path erişiminde "/vezirhan". */
  base: string;
  cartLines: CartLine[];
  addProduct: (product: Product) => void;
  track: (type: MenuEventType, target: string, label: string) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: UIKey, vars?: Record<string, string | number>) => string;
  tf: (entity: Translatable, field: TranslatableField) => string;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu, MenuProvider içinde kullanılmalı");
  return ctx;
}

// Ziyaretçi istatistiği: hata olursa (ör. koleksiyon henüz yok) menüyü asla bozmasın.
function sendEvent(businessId: string, type: MenuEventType, target: string, label: string) {
  pb.collection("events")
    .create({ business: businessId, type, target, label }, { requestKey: null })
    .catch(() => {});
}

const PAGE_LABELS: Record<string, string> = {
  welcome: "Karşılama",
  menu: "Menü (kategoriler)",
  category: "Kategori sayfası",
  product: "Ürün sayfası",
  search: "Arama",
  degerlendir: "Değerlendirme",
};

// Her rota değişiminde bir page_view kaydeder (aynı path'e art arda tekrar yazmaz).
function TrackPageViews({ business, base }: { business: Business; base: string }) {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    let kind = "welcome";
    if (pathname.startsWith(`${base}/categories/`)) kind = "category";
    else if (pathname.startsWith(`${base}/products/`)) kind = "product";
    else if (pathname.startsWith(`${base}/menu`)) kind = "menu";
    else if (pathname.startsWith(`${base}/search`)) kind = "search";
    else if (pathname.startsWith(`${base}/review`)) kind = "degerlendir";

    sendEvent(business.id, "page_view", kind, PAGE_LABELS[kind] ?? kind);
  }, [pathname, business.id, base]);

  return null;
}

function isPopupInWindow(popup: Popup) {
  const now = Date.now();
  if (popup.starts_at && new Date(popup.starts_at).getTime() > now) return false;
  if (popup.ends_at && new Date(popup.ends_at).getTime() < now) return false;
  return true;
}

function MenuHeader({ business, base }: { business: Business; base: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t, tf } = useMenu();
  const onWelcome = pathname === `${base}/welcome` || pathname === (base || "/");

  if (onWelcome) return null;

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(`${base}/menu`);
  }

  return (
    <header className="relative flex items-center justify-center border-b border-line bg-paper py-3">
      <button
        onClick={goBack}
        aria-label={t("back")}
        className="absolute start-4 flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: "var(--brand)", color: "var(--brand-on)" }}
      >
        <ArrowLeftIcon size={20} className={isRTLLocale(locale) ? "rotate-180" : undefined} />
      </button>
      <Link href={`${base}/welcome`} aria-label={tf(business, "name")}>
        {business.logo_url ? (
          <span className="relative block h-12 w-12 overflow-hidden rounded-xl border border-line bg-paper">
            <Image src={business.logo_url} alt={tf(business, "name")} fill className="object-cover" />
          </span>
        ) : (
          <span className="font-display text-lg font-bold">{tf(business, "name")}</span>
        )}
      </Link>
    </header>
  );
}

function BottomNav({ base }: { base: string }) {
  const pathname = usePathname();
  const { t } = useMenu();

  const items = [
    {
      href: `${base}/menu`,
      Icon: MenuIcon,
      label: t("navMenu"),
      active:
        pathname.startsWith(`${base}/menu`) ||
        pathname.startsWith(`${base}/categories`) ||
        pathname.startsWith(`${base}/products`),
    },
    { href: `${base}/search`, Icon: SearchIcon, label: t("navSearch"), active: pathname.startsWith(`${base}/search`) },
    { href: `${base}/review`, Icon: MessageIcon, label: t("navReview"), active: pathname.startsWith(`${base}/review`) },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 font-mono text-[10px] uppercase tracking-wider text-ink-soft transition-colors"
            style={item.active ? { color: "var(--brand-text)" } : undefined}
          >
            <item.Icon size={22} strokeWidth={item.active ? 2.2 : 1.8} />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function LanguageSwitcher() {
  const { locale, setLocale, t } = useMenu();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-4 end-4 z-50">
      {open && <div className="fixed inset-0" onClick={() => setOpen(false)} />}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("chooseLanguage")}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper font-mono text-[12px] font-bold uppercase tracking-wider text-ink shadow-sm"
      >
        {localeCodes[locale]}
      </button>
      {open && (
        <div className="absolute end-0 top-12 min-w-[10rem] overflow-hidden rounded-2xl border border-line bg-paper shadow-lg">
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 whitespace-nowrap px-4 py-2.5 text-sm hover:bg-crema/60"
              style={l === locale ? { color: "var(--brand-text)", fontWeight: 600 } : undefined}
            >
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">{localeCodes[l]}</span>
              <span>{localeLabels[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MenuProvider({
  business,
  popup,
  basePath,
  children,
}: {
  business: Business;
  popup: Popup | null;
  basePath: string;
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null);
  const [pickerOptions, setPickerOptions] = useState<ProductOption[]>([]);
  const [popupDismissed, setPopupDismissed] = useState(true);
  const [locale, setLocaleState] = useState<Locale>("tr");

  useEffect(() => {
    setCart(loadCart(business.slug));
  }, [business.slug]);

  useEffect(() => {
    setLocaleState(getStoredLocale());
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    storeLocale(next);
  }

  function t(key: UIKey, vars?: Record<string, string | number>) {
    return translate(locale, key, vars);
  }

  function tf(entity: Translatable, field: TranslatableField) {
    return tField(entity, field, locale);
  }

  useEffect(() => {
    if (!popup) return;
    const key = `menuva-popup-${business.slug}-${popup.id}`;
    if (!sessionStorage.getItem(key) && isPopupInWindow(popup)) {
      setPopupDismissed(false);
    }
  }, [popup, business.slug]);

  function dismissPopup() {
    if (popup) sessionStorage.setItem(`menuva-popup-${business.slug}-${popup.id}`, "1");
    setPopupDismissed(true);
  }

  function persistCart(next: CartLine[]) {
    setCart(next);
    saveCart(business.slug, next);
  }

  function addToCart(product: Product, selections: CartSelection[], quantity: number) {
    const key = lineKey(product.id, selections);
    const unitPrice = unitPriceFor(product, selections);
    const existing = cart.find((l) => l.key === key);
    const next = existing
      ? cart.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l))
      : [...cart, { key, productId: product.id, name: tf(product, "name"), unitPrice, quantity, selections }];
    persistCart(next);
    sendEvent(business.id, "add_to_cart", product.id, product.name);
  }

  function track(type: MenuEventType, target: string, label: string) {
    sendEvent(business.id, type, target, label);
  }

  async function addProduct(product: Product) {
    const options = await pb.collection("product_options").getFullList<ProductOption>({
      filter: pb.filter("product = {:id}", { id: product.id }),
      requestKey: null,
      sort: "order,created",
    });
    if (options.length === 0) {
      addToCart(product, [], 1);
    } else {
      setPickerOptions(options);
      setPickerProduct(product);
    }
  }

  function updateQuantity(key: string, quantity: number) {
    const next =
      quantity <= 0 ? cart.filter((l) => l.key !== key) : cart.map((l) => (l.key === key ? { ...l, quantity } : l));
    persistCart(next);
  }

  function removeLine(key: string) {
    persistCart(cart.filter((l) => l.key !== key));
  }

  const brand = getThemeColor(business.theme);
  const brandFill = visibleFill(brand);
  const brandStyle = {
    "--brand": brandFill,
    "--brand-on": pickReadableOn(brandFill),
    "--brand-text": readableAccent(brand),
  } as CSSProperties;

  return (
    <MenuContext.Provider value={{ business, base: basePath, cartLines: cart, addProduct, track, locale, setLocale, t, tf }}>
      <div
        lang={locale}
        dir={isRTLLocale(locale) ? "rtl" : "ltr"}
        style={brandStyle}
        className="min-h-screen bg-paper pb-24"
      >
        <TrackPageViews business={business} base={basePath} />
        <LanguageSwitcher />
        {popup && !popupDismissed && <PopupModal popup={popup} onClose={dismissPopup} />}
        {pickerProduct && (
          <OptionPicker
            product={pickerProduct}
            options={pickerOptions}
            onClose={() => setPickerProduct(null)}
            onConfirm={(selections, quantity) => {
              addToCart(pickerProduct, selections, quantity);
              setPickerProduct(null);
            }}
          />
        )}

        <MenuHeader business={business} base={basePath} />
        <main className="mx-auto max-w-3xl">{children}</main>

        <CartBar lines={cart} onOpen={() => setCartOpen(true)} />
        {cartOpen && (
          <CartDrawer lines={cart} onClose={() => setCartOpen(false)} onUpdateQuantity={updateQuantity} onRemove={removeLine} />
        )}
        <BottomNav base={basePath} />
      </div>
    </MenuContext.Provider>
  );
}
