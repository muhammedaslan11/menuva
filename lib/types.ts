import type { Locale, Translations } from "@/lib/i18n";

export type Plan = "freemium" | "premium" | "elite";
export type Template = "liste" | "grid";

export type Allergen =
  | "gluten"
  | "laktoz"
  | "yumurta"
  | "findik_fistik"
  | "yer_fistigi"
  | "soya"
  | "balik"
  | "kabuklu_deniz_urunu"
  | "susam"
  | "hardal"
  | "kereviz"
  | "sulfit";

export type Badge =
  | "yeni"
  | "sefin_onerisi"
  | "populer"
  | "vejetaryen"
  | "vegan"
  | "aci"
  | "glutensiz";

export type Highlight =
  | "wifi"
  | "vale"
  | "otopark"
  | "cocuk_oyun_alani"
  | "evcil_hayvan_dostu"
  | "teras"
  | "canli_muzik"
  | "rezervasyon"
  | "kredi_karti"
  | "engelli_erisimi"
  | "sigara_alani"
  | "kahvalti";

export interface Business {
  id: string;
  owner: string;
  name: string;
  slug: string;
  description: string;
  email: string;
  logo_url: string;
  cover_url: string;
  theme: string;
  /** Özel marka rengi (hex). Doluysa preset `theme` yerine bu kullanılır. */
  theme_color?: string;
  /** lib/surfaces.ts'teki SurfaceKey — menü arka planı/yüzey tonu. Boşsa "paper". */
  menu_bg?: string;
  /** lib/fonts.ts'teki FontKey — menü yazı tipi. Boşsa varsayılan (figtree). */
  font?: string;
  template: Template;
  phone: string;
  address: string;
  working_hours: string;
  highlights: Highlight[];
  whatsapp: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  facebook: string;
  google_maps_url: string;
  google_review_url: string;
  wifi_password: string;
  plan: Plan;
  is_active: boolean;
  /** İşletmenin ana (baz) dili — ana metinler (name/description) bu dilde tutulur.
   *  Seçilmemişse Türkçe kabul edilir (bkz. lib/i18n.ts mainLocale). */
  main_language?: Locale;
  /** Ana dil dışındaki aktif ek diller. main_language ve languages alanlarının
   *  ikisi de tanımsızsa (eski kayıt) tüm diller aktif sayılır. */
  languages?: Locale[];
  translations?: Translations;
  created: string;
  updated: string;
}

export type MenuEventType = "page_view" | "category_view" | "product_view" | "add_to_cart";

export interface MenuEvent {
  id: string;
  business: string;
  type: MenuEventType;
  target: string;
  label: string;
  created: string;
  updated: string;
}

export interface Review {
  id: string;
  business: string;
  is_first_visit: boolean;
  hygiene: number;
  satisfaction: number;
  revisit: number;
  comment: string;
  created: string;
  updated: string;
}

export interface Category {
  id: string;
  business: string;
  name: string;
  description: string;
  image_url: string;
  order: number;
  is_active: boolean;
  translations?: Translations;
  created: string;
  updated: string;
}

export interface Product {
  id: string;
  business: string;
  category: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  prep_time_min: number;
  prep_time_max: number;
  calories: number;
  allergens: Allergen[];
  badges: Badge[];
  is_available: boolean;
  order: number;
  discount_percent: number;
  campaign_label: string;
  translations?: Translations;
  created: string;
  updated: string;
  expand?: {
    category?: Category;
  };
}

export interface ProductOption {
  id: string;
  product: string;
  group_name: string;
  name: string;
  price_delta: number;
  order: number;
  translations?: Translations;
  created: string;
  updated: string;
}

export interface Popup {
  id: string;
  business: string;
  title: string;
  message: string;
  image_url: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  translations?: Translations;
  created: string;
  updated: string;
}

// ─── Admin paneli ──────────────────────────────────────────────────

export interface PlanLimits {
  max_businesses: number | null;
  max_menus: number | null;
  max_products: number | null;
  analytics: boolean;
  custom_domain: boolean;
  branding_removal: boolean;
  campaigns: boolean;
  team_management: boolean;
  white_label: boolean;
  api_access: boolean;
}

export interface PlanRecord {
  id: string;
  key: Plan;
  name: string;
  description: string;
  price_6m: number;
  price_12m: number;
  features: string[];
  limits: PlanLimits;
  is_active: boolean;
  is_default: boolean;
  order: number;
  created: string;
  updated: string;
}

export type TicketStatus = "open" | "answered" | "closed";

export interface SupportTicket {
  id: string;
  business: string;
  user: string;
  subject: string;
  status: TicketStatus;
  created: string;
  updated: string;
  expand?: {
    business?: Business;
    user?: { id: string; name: string; email: string };
  };
}

export type TicketSender = "user" | "admin";

export interface TicketMessage {
  id: string;
  ticket: string;
  sender: TicketSender;
  admin?: string;
  body: string;
  created: string;
  updated: string;
  expand?: {
    admin?: { id: string; name: string };
  };
}

export type NotificationAudience = "all" | "freemium" | "premium" | "elite" | "user";

export interface Notification {
  id: string;
  title: string;
  body: string;
  audience: NotificationAudience;
  user?: string;
  created_by: string;
  created: string;
  updated: string;
}

export interface NotificationRead {
  id: string;
  notification: string;
  user: string;
  created: string;
  updated: string;
}

export interface AdminLog {
  id: string;
  admin?: string;
  action: string;
  target: string;
  meta: Record<string, unknown>;
  ip: string;
  user_agent: string;
  created: string;
  updated: string;
  expand?: {
    admin?: { id: string; name: string; email: string };
  };
}
