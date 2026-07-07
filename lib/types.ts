import type { Translations } from "@/lib/i18n";

export type Plan = "ucretsiz" | "baslangic" | "pro" | "isletme";
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
  created: string;
  updated: string;
}
