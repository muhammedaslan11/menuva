"use client";

import { useState, type FormEvent } from "react";
import { ClientResponseError } from "pocketbase";
import { pb } from "@/lib/pocketbase";
import { useBusiness } from "@/components/panel/business-context";
import { uploadFile } from "@/lib/upload";
import { isReservedSlug, slugify } from "@/lib/slug";
import { themes } from "@/lib/themes";
import { ROOT_DOMAIN } from "@/lib/site";
import { highlightLabels } from "@/lib/labels";
import { HighlightIcon } from "@/components/icons";
import { Button, Card, ErrorText, Input, Label, PageHeader, Select, Textarea } from "@/components/panel/ui";
import { TranslationsEditor } from "@/components/panel/translations-editor";
import type { Translations } from "@/lib/i18n";
import type { Business, Highlight, Template } from "@/lib/types";

const ALL_HIGHLIGHTS = Object.keys(highlightLabels.tr) as Highlight[];
const MAX_HIGHLIGHTS = 3;

function ImagePicker({
  label,
  value,
  onChange,
  businessId,
  kind,
  aspect,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  businessId: string;
  kind: "logo" | "cover";
  aspect: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, businessId, kind);
      onChange(url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className={`relative overflow-hidden rounded-xl border border-dashed border-line bg-crema/30 ${aspect}`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-soft">Görsel yok</div>
        )}
        <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-ink/0 text-transparent transition-colors hover:bg-ink/40 hover:text-paper">
          <span className="font-mono text-[11px] uppercase tracking-wider">{uploading ? "Yükleniyor…" : "Değiştir"}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files)}
          />
        </label>
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
  const [template, setTemplate] = useState<Template>(business.template || "liste");
  const [logoUrl, setLogoUrl] = useState(business.logo_url);
  const [coverUrl, setCoverUrl] = useState(business.cover_url);
  const [translations, setTranslations] = useState<Translations>(business.translations ?? {});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

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
        template,
        logo_url: logoUrl,
        cover_url: coverUrl,
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

  return (
    <div>
      <PageHeader title="İşletme ayarları" description={savedAt ? "Kaydedildi ✓" : "Menünün görünümünü ve bilgilerini düzenle."} />
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Genel bilgiler</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Kayıt tarihi: {registeredAt}</p>
          </div>
          <div>
            <Label htmlFor="b-name">İşletme adı</Label>
            <Input id="b-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="b-slug">Menü adresi</Label>
            <div className="flex items-center gap-1 rounded-xl border border-line bg-crema/40 px-4 py-2.5 text-sm">
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
          <div>
            <Label htmlFor="b-desc">Açıklama</Label>
            <Textarea id="b-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="border-t border-line pt-4">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              Çeviriler (opsiyonel) — boş bırakılırsa Türkçe gösterilir
            </p>
            <TranslationsEditor
              value={translations}
              onChange={setTranslations}
              fields={[
                { key: "name", label: "İşletme adı" },
                { key: "description", label: "Açıklama", multiline: true },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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

        <Card className="grid gap-4 sm:grid-cols-2">
          <ImagePicker label="Logo" value={logoUrl} onChange={setLogoUrl} businessId={business.id} kind="logo" aspect="aspect-square" />
          <ImagePicker
            label="Kapak görseli"
            value={coverUrl}
            onChange={setCoverUrl}
            businessId={business.id}
            kind="cover"
            aspect="aspect-[2/1]"
          />
        </Card>

        <Card className="space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Tema</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="b-theme">Tema rengi</Label>
              <Select id="b-theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
                {Object.entries(themes).map(([key, { name, color }]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </Select>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-line p-3">
                <div
                  className="h-8 w-8 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: themes[theme as keyof typeof themes]?.color || themes.paprika.color }}
                />
                <span className="text-sm font-mono uppercase tracking-wider text-ink-soft">
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
          </div>
        </Card>

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

        <Card className="space-y-4">
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
              Doluysa değerlendirme gönderen müşteriye &ldquo;Google&apos;da da değerlendir&rdquo; butonu gösterilir. Linki Google
              Business Profile panelindeki &ldquo;Yorum isteyin&rdquo; kısmından alabilirsin.
            </p>
          </div>
          <div>
            <Label htmlFor="b-wifi">WiFi şifresi</Label>
            <Input
              id="b-wifi"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
              placeholder="kafe-wifi-2026"
            />
            <p className="mt-1.5 text-xs text-ink-soft">Doluysa menünün karşılama sayfasında müşteriye gösterilir.</p>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Sosyal medya & iletişim</p>
          <div className="grid grid-cols-2 gap-3">
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

        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={saving}>
          Kaydet
        </Button>
      </form>
    </div>
  );
}
