// Menü içeriği (işletme/kategori/ürün adı & açıklaması) çoklu dil desteği.
// Varsayılan dil Türkçe'dir ve her zaman ana `name`/`description` alanından okunur;
// diğer diller `translations` alanındaki opsiyonel çeviriden okunur, boşsa Türkçe'ye düşer.
export const DEFAULT_LOCALE = "tr";

export const SUPPORTED_LOCALES = ["tr", "en", "ar", "ru"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const NON_DEFAULT_LOCALES = SUPPORTED_LOCALES.filter((l) => l !== DEFAULT_LOCALE) as Locale[];

export const localeLabels: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
  ru: "Русский",
};

export const localeCodes: Record<Locale, string> = {
  tr: "TR",
  en: "EN",
  ar: "AR",
  ru: "RU",
};

export function isRTLLocale(locale: Locale): boolean {
  return locale === "ar";
}

export type TranslatableField = "name" | "description";

export type Translations = Partial<Record<Locale, Partial<Record<TranslatableField, string>>>>;

export interface Translatable {
  name: string;
  description?: string;
  translations?: Translations;
}

// Verilen alanı istenen dilde döndürür; çeviri yoksa veya boşsa Türkçe'ye düşer.
export function tField(entity: Translatable, field: TranslatableField, locale: Locale): string {
  const base = entity[field] ?? "";
  if (locale === DEFAULT_LOCALE) return base;
  const translated = entity.translations?.[locale]?.[field];
  return translated && translated.trim() !== "" ? translated : base;
}

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

const LOCALE_STORAGE_KEY = "menuva-locale";

// Ziyaretçinin seçtiği dili tarayıcıda hatırlar; SSR'da her zaman varsayılana düşer.
export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isSupportedLocale(stored) ? stored : DEFAULT_LOCALE;
}

export function storeLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

// Müşteri menüsündeki sabit arayüz metinleri (ürün/kategori adları değil — bunlar için tField kullanılır).
const UI_STRINGS = {
  back: { tr: "Geri", en: "Back", ar: "رجوع", ru: "Назад" },
  navMenu: { tr: "Menü", en: "Menu", ar: "القائمة", ru: "Меню" },
  navSearch: { tr: "Ara", en: "Search", ar: "بحث", ru: "Поиск" },
  navReview: { tr: "Değerlendir", en: "Review", ar: "تقييم", ru: "Отзыв" },
  loading: { tr: "Yükleniyor…", en: "Loading…", ar: "جارٍ التحميل…", ru: "Загрузка…" },
  menuPreparing: {
    tr: "Menü hazırlanıyor, birazdan burada olacak.",
    en: "The menu is being prepared, it'll be here shortly.",
    ar: "القائمة قيد التحضير، ستكون هنا قريبًا.",
    ru: "Меню готовится, скоро оно появится здесь.",
  },
  noProductsInCategory: {
    tr: "Bu kategoride henüz ürün yok.",
    en: "There are no products in this category yet.",
    ar: "لا توجد منتجات في هذه الفئة بعد.",
    ru: "В этой категории пока нет товаров.",
  },
  allergensLabel: { tr: "Alerjenler", en: "Allergens", ar: "مسببات الحساسية", ru: "Аллергены" },
  allergenPrefix: { tr: "Alerjen", en: "Allergens", ar: "مسببات الحساسية", ru: "Аллергены" },
  minUnit: { tr: "dk", en: "min", ar: "د", ru: "мин" },
  addToCart: { tr: "Sepete ekle", en: "Add to cart", ar: "أضف إلى السلة", ru: "В корзину" },
  searchPlaceholder: {
    tr: "Ürün ara… (ör. burger, latte)",
    en: "Search products… (e.g. burger, latte)",
    ar: "ابحث عن منتج… (مثل برجر، لاتيه)",
    ru: "Поиск блюд… (например, бургер, латте)",
  },
  searchHint: {
    tr: "Menüdeki tüm ürünlerde arama yap.",
    en: "Search across all products in the menu.",
    ar: "ابحث في جميع منتجات القائمة.",
    ru: "Поиск по всем блюдам меню.",
  },
  noSearchResults: {
    tr: "“{query}” için sonuç bulunamadı.",
    en: "No results found for “{query}”.",
    ar: "لا توجد نتائج لـ «{query}».",
    ru: "По запросу «{query}» ничего не найдено.",
  },
  reviewUsCta: { tr: "Bizi değerlendir!", en: "Rate us!", ar: "قيّمنا!", ru: "Оцените нас!" },
  menuButton: { tr: "Menü", en: "Menu", ar: "القائمة", ru: "Меню" },
  wifiPasswordLabel: { tr: "Wifi Şifresi", en: "Wifi Password", ar: "كلمة مرور الواي فاي", ru: "Пароль Wi-Fi" },
  addressLabel: { tr: "Adres", en: "Address", ar: "العنوان", ru: "Адрес" },
  phoneLabel: { tr: "Telefon", en: "Phone", ar: "الهاتف", ru: "Телефон" },
  locationLabel: { tr: "Konum", en: "Location", ar: "الموقع", ru: "Локация" },
  workingHoursLabel: { tr: "Çalışma Saatleri", en: "Working Hours", ar: "ساعات العمل", ru: "Часы работы" },
  showOnMap: { tr: "Haritada göster", en: "Show on map", ar: "أظهر على الخريطة", ru: "Показать на карте" },
  reviewTitle: { tr: "Bizi değerlendir", en: "Rate us", ar: "قيّمنا", ru: "Оцените нас" },
  firstVisitQuestion: {
    tr: "İlk defa mı ziyaret ediyorsunuz?",
    en: "Is this your first visit?",
    ar: "هل هذه زيارتك الأولى؟",
    ru: "Вы посещаете нас впервые?",
  },
  yes: { tr: "Evet", en: "Yes", ar: "نعم", ru: "Да" },
  no: { tr: "Hayır", en: "No", ar: "لا", ru: "Нет" },
  hygieneQuestion: {
    tr: "Hijyeni nasıl değerlendiriyorsunuz?",
    en: "How would you rate our hygiene?",
    ar: "كيف تقيّم مستوى النظافة؟",
    ru: "Как вы оцениваете гигиену?",
  },
  satisfactionQuestion: {
    tr: "Genel memnuniyetiniz nasıldır?",
    en: "How satisfied are you overall?",
    ar: "ما مدى رضاك العام؟",
    ru: "Насколько вы в целом довольны?",
  },
  revisitQuestion: {
    tr: "Tekrar ziyaret etmeyi düşünür müsünüz?",
    en: "Would you consider visiting again?",
    ar: "هل تفكر في زيارتنا مرة أخرى؟",
    ru: "Рассмотрите ли вы повторный визит?",
  },
  otherCommentsQuestion: {
    tr: "Bizimle paylaşmak istediğiniz başka bir konu var mı?",
    en: "Anything else you'd like to share with us?",
    ar: "هل هناك أي شيء آخر تود مشاركته معنا؟",
    ru: "Хотите поделиться чем-то ещё?",
  },
  commentPlaceholder: { tr: "Görüşlerini yaz…", en: "Write your thoughts…", ar: "اكتب رأيك…", ru: "Напишите ваш отзыв…" },
  send: { tr: "Gönder", en: "Send", ar: "إرسال", ru: "Отправить" },
  sending: { tr: "Gönderiliyor…", en: "Sending…", ar: "جارٍ الإرسال…", ru: "Отправка…" },
  reviewMinOneError: {
    tr: "Göndermeden önce en az bir soruyu yanıtla.",
    en: "Answer at least one question before sending.",
    ar: "أجب عن سؤال واحد على الأقل قبل الإرسال.",
    ru: "Ответьте хотя бы на один вопрос перед отправкой.",
  },
  reviewSendError: {
    tr: "Gönderilemedi, tekrar dene.",
    en: "Couldn't be sent, please try again.",
    ar: "تعذر الإرسال، حاول مرة أخرى.",
    ru: "Не удалось отправить, попробуйте снова.",
  },
  thankYouTitle: { tr: "Teşekkürler!", en: "Thank you!", ar: "شكرًا لك!", ru: "Спасибо!" },
  thankYouBody: {
    tr: "Değerlendirmen bize ulaştı. Görüşlerin {name} için çok değerli.",
    en: "Your review has reached us. Your feedback means a lot to {name}.",
    ar: "وصلنا تقييمك. رأيك يعني الكثير لـ {name}.",
    ru: "Ваш отзыв получен. Ваше мнение очень важно для {name}.",
  },
  googleReviewCta: {
    tr: "Google'da da değerlendir",
    en: "Also review us on Google",
    ar: "قيّمنا أيضًا على جوجل",
    ru: "Оцените нас также в Google",
  },
  orGoogleReview: {
    tr: "veya doğrudan Google'da değerlendir",
    en: "or review directly on Google",
    ar: "أو قيّم مباشرة على جوجل",
    ru: "или оцените напрямую в Google",
  },
  backToMenu: { tr: "Menüye dön", en: "Back to menu", ar: "العودة إلى القائمة", ru: "Вернуться в меню" },
  starAria: { tr: "{n} yıldız", en: "{n} stars", ar: "{n} نجوم", ru: "{n} звёзд" },
  cartBarLabel: { tr: "Sepet · {count} ürün", en: "Cart · {count} items", ar: "السلة · {count} عناصر", ru: "Корзина · {count} тов." },
  cartTitle: { tr: "Sepetin", en: "Your cart", ar: "سلتك", ru: "Ваша корзина" },
  close: { tr: "Kapat", en: "Close", ar: "إغلاق", ru: "Закрыть" },
  cartEmpty: { tr: "Sepetin boş.", en: "Your cart is empty.", ar: "سلتك فارغة.", ru: "Ваша корзина пуста." },
  decrease: { tr: "Azalt", en: "Decrease", ar: "إنقاص", ru: "Уменьшить" },
  increase: { tr: "Artır", en: "Increase", ar: "زيادة", ru: "Увеличить" },
  remove: { tr: "Kaldır", en: "Remove", ar: "إزالة", ru: "Удалить" },
  total: { tr: "Toplam", en: "Total", ar: "الإجمالي", ru: "Итого" },
  showToWaiter: {
    tr: "Siparişini vermek için bu ekranı garsona göster.",
    en: "Show this screen to your server to place the order.",
    ar: "أظهر هذه الشاشة للنادل لتقديم طلبك.",
    ru: "Покажите этот экран официанту, чтобы сделать заказ.",
  },
  viewMenu: { tr: "Menüye göz at", en: "View menu", ar: "تصفح القائمة", ru: "Смотреть меню" },
  chooseLanguage: { tr: "Dil seçin", en: "Choose language", ar: "اختر اللغة", ru: "Выберите язык" },
} as const satisfies Record<string, Record<Locale, string>>;

export type UIKey = keyof typeof UI_STRINGS;

// Statik arayüz metinlerini seçili dile çevirir; {token} biçimindeki yer tutucuları vars ile değiştirir.
export function t(locale: Locale, key: UIKey, vars?: Record<string, string | number>): string {
  const template: string = UI_STRINGS[key][locale] ?? UI_STRINGS[key][DEFAULT_LOCALE];
  if (!vars) return template;
  return Object.entries(vars).reduce((acc: string, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), template);
}
