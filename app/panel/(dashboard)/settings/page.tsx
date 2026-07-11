"use client";

import { useState, type FormEvent } from "react";
import { ClientResponseError } from "pocketbase";
import { pb } from "@/lib/pocketbase";
import { useBusiness } from "@/components/panel/business-context";
import { uploadFile, type UploadKind } from "@/lib/upload";
import { isReservedSlug, slugify } from "@/lib/slug";
import { themes } from "@/lib/themes";
import { fonts, DEFAULT_FONT, getFontStack } from "@/lib/fonts";
import { ROOT_DOMAIN } from "@/lib/site";
import { highlightLabels } from "@/lib/labels";
import { HighlightIcon } from "@/components/icons";
import { Card, ErrorText, FormActions, Input, Label, PageHeader, Select, Spinner, Tabs, Textarea } from "@/components/panel/ui";
import { MultiLangFields } from "@/components/panel/multi-lang-fields";
import {
  activeNonMainLocales,
  localeCodes,
  localeLabels,
  mainLocale,
  SUPPORTED_LOCALES,
  type Locale,
  type Translations,
} from "@/lib/i18n";
import type { Business, Highlight, Template } from "@/lib/types";

const ALL_HIGHLIGHTS = Object.keys(highlightLabels.tr) as Highlight[];
const MAX_HIGHLIGHTS = 3;

type SettingsTab = "genel" | "diller" | "tema" | "ozellik" | "iletisim" | "sosyal";
const SETTINGS_TABS: { key: SettingsTab; label: string }[] = [
  { key: "genel", label: "Genel bilgiler" },
  { key: "diller", label: "Menü dilleri" },
  { key: "tema", label: "Tema" },
  { key: "ozellik", label: "Öne çıkan özellikler" },
  { key: "iletisim", label: "Adres & iletişim" },
  { key: "sosyal", label: "Sosyal medya" },
];

// Kapak + yuvarlak logo başlığı (sosyal profil düzeni). Logo kapağın sol altına
// yarısı binecek şekilde oturur; ikisi de yerinde değiştirilebilir, yükleme
// sırasında loader gösterilir.
function ProfileImages({
  businessId,
  logoUrl,
  coverUrl,
  onLogo,
  onCover,
}: {
  businessId: string;
  logoUrl: string;
  coverUrl: string;
  onLogo: (url: string) => void;
  onCover: (url: string) => void;
}) {
  const [logoBusy, setLogoBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);

  async function upload(
    files: FileList | null,
    kind: UploadKind,
    setBusy: (b: boolean) => void,
    onChange: (url: string) => void
  ) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadFile(file, businessId, kind));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-2">
      {/* Kapak */}
      <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-line bg-crema/40 sm:h-44">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="Kapak" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-soft">Kapak görseli yok</div>
        )}
        {coverBusy && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <Spinner className="h-7 w-7 text-paper" />
          </div>
        )}
        {!coverBusy && (
          <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-ink/0 text-transparent transition-colors hover:bg-ink/40 hover:text-paper">
            <span className="font-mono text-[11px] uppercase tracking-wider">{coverUrl ? "Kapağı değiştir" : "Kapak yükle"}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(e) => upload(e.target.files, "cover", setCoverBusy, onCover)}
            />
          </label>
        )}
      </div>

      {/* Logo — kapağın sol altına biner */}
      <div className="relative z-10 -mt-12 ml-5 h-24 w-24">
        <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-paper bg-crema shadow-md">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-[10px] leading-tight text-ink-soft">Logo yok</div>
          )}
          {logoBusy && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
              <Spinner className="h-6 w-6 text-paper" />
            </div>
          )}
          {!logoBusy && (
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-ink/0 text-transparent transition-colors hover:bg-ink/50 hover:text-paper">
              <span className="font-mono text-[9px] uppercase tracking-wider">Değiştir</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={(e) => upload(e.target.files, "logo", setLogoBusy, onLogo)}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { business, isLoading, setBusiness } = useBusiness();

  if (isLoading || !business) {
    return <p className="text-ink-soft">Yükleniyor…</p>;
  }

  return <SettingsForm business={business} onSaved={setBusiness} />;
}

function SettingsForm({ business, onSaved }: { business: Business; onSaved: (b: Business) => void }) {
  const [name, setName] = useState(business.name);
  const [slug, setSlug] = useState(business.slug);
  const [description, setDescription] = useState(business.description);
  const [email, setEmail] = useState(business.email);
  const [phone, setPhone] = useState(business.phone);
  const [address, setAddress] = useState(business.address);
  const [workingHours, setWorkingHours] = useState(business.working_hours);
  const [highlights, setHighlights] = useState<Highlight[]>(business.highlights ?? []);
  const [whatsapp, setWhatsapp] = useState(business.whatsapp);
  const [instagram, setInstagram] = useState(business.instagram);
  const [tiktok, setTiktok] = useState(business.tiktok);
  const [youtube, setYoutube] = useState(business.youtube);
  const [facebook, setFacebook] = useState(business.facebook);
  const [googleMapsUrl, setGoogleMapsUrl] = useState(business.google_maps_url);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(business.google_review_url);
  const [wifiPassword, setWifiPassword] = useState(business.wifi_password);
  const [theme, setTheme] = useState(business.theme || "paprika");
  const [font, setFont] = useState(business.font || DEFAULT_FONT);
  const [template, setTemplate] = useState<Template>(business.template || "liste");
  const [logoUrl, setLogoUrl] = useState(business.logo_url);
  const [coverUrl, setCoverUrl] = useState(business.cover_url);
  const [mainLang, setMainLang] = useState<Locale>(mainLocale(business));
  // Ana dil dışındaki aktif ek diller.
  const [languages, setLanguages] = useState<Locale[]>(activeNonMainLocales(business));
  const [translations, setTranslations] = useState<Translations>(business.translations ?? {});
  const [tab, setTab] = useState<SettingsTab>("genel");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Ana dili değiştirince, o dil ek diller listesinden çıkarılır.
  function changeMainLang(next: Locale) {
    setMainLang(next);
    setLanguages((prev) => prev.filter((l) => l !== next));
  }

  function toggleLanguage(l: Locale) {
    setLanguages((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  }

  function toggleHighlight(h: Highlight) {
    setHighlights((prev) => {
      if (prev.includes(h)) return prev.filter((x) => x !== h);
      if (prev.length >= MAX_HIGHLIGHTS) return prev;
      return [...prev, h];
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (isReservedSlug(slugify(slug))) {
      setError("Bu menü adresi sisteme ayrılmış, başka bir tane seç.");
      return;
    }
    setSaving(true);
    try {
      const updated = await pb.collection("businesses").update<Business>(business.id, {
        name,
        slug: slugify(slug),
        description,
        email,
        phone,
        address,
        working_hours: workingHours,
        highlights,
        whatsapp,
        instagram,
        tiktok,
        youtube,
        facebook,
        google_maps_url: googleMapsUrl,
        google_review_url: googleReviewUrl,
        wifi_password: wifiPassword,
        theme,
        font,
        template,
        logo_url: logoUrl,
        cover_url: coverUrl,
        main_language: mainLang,
        languages,
        translations,
      });
      onSaved(updated);
      setSavedAt(Date.now());
    } catch (err) {
      if (err instanceof ClientResponseError && err.response?.data?.slug) {
        setError("Bu adres başka bir işletme tarafından kullanılıyor.");
      } else {
        setError("Kaydedilemedi, tekrar dene.");
      }
    } finally {
      setSaving(false);
    }
  }

  const registeredAt = new Date(business.created).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const extraOptions = SUPPORTED_LOCALES.filter((l) => l !== mainLang);

  return (
    <div>
      <PageHeader title="İşletme ayarları" description={savedAt ? "Kaydedildi ✓" : "Menünün görünümünü ve bilgilerini düzenle."} />
      <form onSubmit={handleSubmit} className="space-y-8">
        <FormActions saving={saving} saved={!!savedAt} />
        <ErrorText>{error}</ErrorText>

        <Tabs tabs={SETTINGS_TABS} active={tab} onChange={setTab} />

        {tab === "genel" && (
          <div className="space-y-8">
        {/* Kapak + logo başlığı */}
        <Card className="space-y-4">
          <ProfileImages
            businessId={business.id}
            logoUrl={logoUrl}
            coverUrl={coverUrl}
            onLogo={setLogoUrl}
            onCover={setCoverUrl}
          />
        </Card>

        {/* Genel bilgiler */}
        <Card className="space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Kayıt tarihi: {registeredAt}</p>
          <div>
            <Label htmlFor="b-name">İşletme adı</Label>
            <Input id="b-name" required value={name} onChange={(e) => setName(e.target.value)} />
            <p className="mt-1.5 text-xs text-ink-soft">İşletme adı tekildir, tüm dillerde aynı görünür.</p>
          </div>
          <div>
            <Label htmlFor="b-slug">Menü adresi</Label>
            <div className="flex items-center gap-1 rounded-2xl border border-line bg-crema/40 px-4 py-2.5 text-sm">
              <input
                id="b-slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-right text-ink outline-none"
              />
              <span className="shrink-0 text-ink-soft">.{ROOT_DOMAIN}</span>
            </div>
            <p className="mt-1.5 text-xs text-ink-soft">Adresi değiştirirsen eski QR kodların çalışmaz, yeniden bastırman gerekir.</p>
          </div>
          <MultiLangFields
            locales={[mainLang, ...languages]}
            mainLocale={mainLang}
            base={{ description }}
            onBaseChange={(_, v) => setDescription(v)}
            translations={translations}
            onTranslationsChange={setTranslations}
            fields={[{ key: "description", label: "Açıklama", multiline: true }]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="b-email">E-posta</Label>
              <Input id="b-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="merhaba@isletme.com" />
            </div>
            <div>
              <Label htmlFor="b-phone">Telefon</Label>
              <Input id="b-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0555 123 45 67" />
            </div>
          </div>
        </Card>
          </div>
        )}

        {tab === "diller" && (
        <Card className="space-y-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Menü dilleri</p>
            <p className="mt-1 text-xs text-ink-soft">
              Ana dil, metinlerin girildiği baz dildir. Ek diller için ürün/kategori/açıklama çevirilerini girebilirsin;
              müşteri menüsünde dil seçimi bu dillerle sınırlanır.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="b-mainlang">Ana dil</Label>
              <Select id="b-mainlang" value={mainLang} onChange={(e) => changeMainLang(e.target.value as Locale)}>
                {SUPPORTED_LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {localeLabels[l]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Ek diller</Label>
            <div className="flex flex-wrap gap-2">
              {extraOptions.map((l) => {
                const selected = languages.includes(l);
                return (
                  <button
                    type="button"
                    key={l}
                    onClick={() => toggleLanguage(l)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      selected
                        ? "border-paprika bg-paprika text-paper"
                        : "border-line text-ink-soft hover:border-paprika hover:text-paprika"
                    }`}
                  >
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider">{localeCodes[l]}</span>
                    {localeLabels[l]}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-ink-soft">
            Açıklama çevirilerini &ldquo;Genel bilgiler&rdquo; sekmesindeki dil sekmelerinden girebilirsin.
          </p>
        </Card>
        )}

        {tab === "tema" && (
        <Card className="space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Tema</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="b-theme">Tema rengi</Label>
              <Select id="b-theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
                {Object.entries(themes).map(([key, { name }]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </Select>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line p-3">
                <div
                  className="h-8 w-8 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: themes[theme as keyof typeof themes]?.color || themes.paprika.color }}
                />
                <span className="font-mono text-sm uppercase tracking-wider text-ink-soft">
                  {themes[theme as keyof typeof themes]?.name || "Paprika"}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="b-template">Görünüm şablonu</Label>
              <Select id="b-template" value={template} onChange={(e) => setTemplate(e.target.value as Template)}>
                <option value="liste">Liste</option>
                <option value="grid">Grid / Kart</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="b-font">Yazı tipi</Label>
              <Select id="b-font" value={font} onChange={(e) => setFont(e.target.value)}>
                {Object.entries(fonts).map(([key, { name }]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </Select>
              <div className="mt-3 rounded-2xl border border-line p-3" style={{ fontFamily: getFontStack(font) }}>
                <p className="text-base font-bold">Izgara Köfte — 285₺</p>
                <p className="text-sm text-ink-soft">Menünüz bu yazı tipiyle görünür.</p>
              </div>
            </div>
          </div>
        </Card>
        )}

        {tab === "ozellik" && (
        <Card className="space-y-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Öne çıkan özellikler</p>
            <p className="mt-1 text-xs text-ink-soft">En fazla {MAX_HIGHLIGHTS} tane seç — menünde rozet olarak görünür.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_HIGHLIGHTS.map((h) => {
              const selected = highlights.includes(h);
              const disabled = !selected && highlights.length >= MAX_HIGHLIGHTS;
              return (
                <button
                  type="button"
                  key={h}
                  disabled={disabled}
                  onClick={() => toggleHighlight(h)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    selected
                      ? "border-paprika bg-paprika text-paper"
                      : "border-line text-ink-soft hover:border-paprika hover:text-paprika disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-soft"
                  }`}
                >
                  <HighlightIcon highlight={h} size={15} strokeWidth={2} />
                  {highlightLabels.tr[h]}
                </button>
              );
            })}
          </div>
        </Card>
        )}

        {tab === "iletisim" && (
        <Card className="space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Adres & iletişim</p>
          <div>
            <Label htmlFor="b-address">Adres</Label>
            <Input id="b-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="b-hours">Çalışma saatleri</Label>
            <Textarea
              id="b-hours"
              rows={3}
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              placeholder={"Pazartesi - Cuma: 09:00 - 22:00\nHafta sonu: 10:00 - 23:00"}
            />
          </div>
          <div>
            <Label htmlFor="b-maps">Google Maps linki</Label>
            <Input
              id="b-maps"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </div>
          <div>
            <Label htmlFor="b-greview">Google yorum linki</Label>
            <Input
              id="b-greview"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              placeholder="https://g.page/r/... veya https://search.google.com/local/writereview?placeid=..."
            />
            <p className="mt-1.5 text-xs text-ink-soft">
              Doluysa değerlendirme gönderen müşteriye &ldquo;Google&apos;da da değerlendir&rdquo; butonu gösterilir.
            </p>
          </div>
          <div>
            <Label htmlFor="b-wifi">WiFi şifresi</Label>
            <Input id="b-wifi" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} placeholder="kafe-wifi-2026" />
            <p className="mt-1.5 text-xs text-ink-soft">Doluysa menünün karşılama sayfasında müşteriye gösterilir.</p>
          </div>
        </Card>
        )}

        {tab === "sosyal" && (
        <Card className="space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Sosyal medya</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="b-whatsapp">WhatsApp</Label>
              <Input id="b-whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+90 555 123 45 67" />
            </div>
            <div>
              <Label htmlFor="b-instagram">Instagram</Label>
              <Input id="b-instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="kullaniciadi" />
            </div>
            <div>
              <Label htmlFor="b-tiktok">TikTok</Label>
              <Input id="b-tiktok" value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="kullaniciadi" />
            </div>
            <div>
              <Label htmlFor="b-youtube">YouTube</Label>
              <Input id="b-youtube" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="@kanaladi" />
            </div>
            <div>
              <Label htmlFor="b-facebook">Facebook</Label>
              <Input id="b-facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="kullaniciadi" />
            </div>
          </div>
        </Card>
        )}

        <ErrorText>{error}</ErrorText>
      </form>
    </div>
  );
}
