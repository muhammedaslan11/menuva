import Link from "next/link";
import { planWhatsappLink, whatsappLink } from "@/lib/site";
import { CheckCircleIcon, WhatsappIcon } from "@/components/icons";

type Plan = {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  href: string;
  external: boolean;
  highlight: boolean;
  badge?: string;
};

const plans: Plan[] = [
  {
    name: "Freemium",
    price: "0₺",
    period: "sonsuza kadar",
    desc: "Denemek ve küçük menüler için",
    features: ["1 menü", "20 ürüne kadar", "QR kod & özel URL", "Anlık güncellemeler"],
    cta: "Ücretsiz başla",
    href: "/panel/register",
    external: false,
    highlight: false,
  },
  {
    name: "Premium",
    price: "—",
    period: "aylık, yakında",
    desc: "Satışı büyütmek isteyen mekanlar için",
    features: [
      "Sınırsız ürün & kategori",
      "Rozetler & kampanyalar",
      "Detaylı analiz paneli",
      "Kalori & alerjen bilgisi",
      "Pop-up kampanyalar",
      "Sipariş sepeti",
      "Markanıza özel tasarım",
    ],
    cta: "Erken erişime katıl",
    href: planWhatsappLink("Premium"),
    external: true,
    highlight: true,
    badge: "En çok tercih edilen",
  },
  {
    name: "Elite",
    price: "—",
    period: "yıllık, yakında",
    desc: "Zincirler ve çoklu şubeler için",
    features: [
      "Premium'daki her şey",
      "Çoklu şube yönetimi",
      "Şube kırılımlı raporlar",
      "Özel alan adı",
      "Öncelikli destek",
    ],
    cta: "Bize yazın",
    href: planWhatsappLink("Elite"),
    external: true,
    highlight: false,
  },
];

function PlanCta({ plan }: { plan: Plan }) {
  const style = plan.highlight
    ? "bg-paprika text-paper hover:bg-paprika-deep hover:shadow-[0_16px_34px_-12px_rgba(232,73,31,0.9)]"
    : "border border-ink text-ink hover:bg-ink hover:text-paper";

  const className = `shine-on-hover relative mt-8 flex items-center justify-center gap-2 overflow-hidden rounded-full py-3.5 text-center font-mono text-[13px] uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 ${style}`;

  // Ücretsiz plan doğrudan kayıt akışına; ücretli planlar hangi paketin
  // konuşulduğu mesaja yazılmış hâlde WhatsApp'a gider.
  if (!plan.external) {
    return (
      <Link href={plan.href} className={className}>
        {plan.cta}
      </Link>
    );
  }

  return (
    <a href={plan.href} target="_blank" rel="noopener noreferrer" className={className}>
      <WhatsappIcon size={15} />
      {plan.cta}
    </a>
  );
}

export function Pricing() {
  return (
    <section id="fiyat" className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-center font-mono text-[13px] uppercase tracking-[0.2em] text-paprika">
        Hesap lütfen
      </p>
      <h2 className="mt-3 text-center font-display text-4xl font-extrabold tracking-tight md:text-5xl">
        Baskı maliyetinden ucuz
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-ink-soft">
        Bir kez menü bastırmanın parasıyla aylarca dijital kalın. Ücretsiz
        planla başlayın, büyüdükçe konuşuruz.
      </p>

      <div className="mt-14 grid items-start gap-5 md:grid-cols-3">
        {plans.map((p, i) => (
          <div
            key={p.name}
            data-reveal
            style={{ transitionDelay: `${i * 90}ms` }}
            className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1.5 ${
              p.highlight
                ? "border-paprika bg-ink text-paper shadow-[0_24px_50px_-20px_rgba(232,73,31,0.4)] hover:shadow-[0_34px_60px_-20px_rgba(232,73,31,0.55)] md:-mt-4"
                : "border-line bg-paper hover:border-ink/30 hover:shadow-[0_24px_50px_-28px_rgba(35,24,18,0.5)]"
            }`}
          >
            {p.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-paprika px-3.5 py-1 font-mono text-[10px] uppercase tracking-wider text-paper">
                {p.badge}
              </span>
            )}

            <h3 className="font-display text-xl font-bold">{p.name}</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-5xl font-extrabold">{p.price}</span>
              <span
                className={`font-mono text-xs uppercase tracking-wider ${
                  p.highlight ? "text-paper/50" : "text-ink-soft"
                }`}
              >
                {p.period}
              </span>
            </div>
            <p className={`mt-2 text-sm ${p.highlight ? "text-paper/60" : "text-ink-soft"}`}>
              {p.desc}
            </p>

            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-herb" aria-hidden>
                    <CheckCircleIcon size={15} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <PlanCta plan={p} />
          </div>
        ))}
      </div>

      <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-wider text-ink-soft/70">
        Ücretsiz planda kredi kartı istemiyoruz · İstediğiniz an bırakabilirsiniz
      </p>
    </section>
  );
}

const faqs = [
  {
    q: "Teknik bilgim yok, kullanabilir miyim?",
    a: "Kesinlikle. menuva, telefon kullanabilen herkes için tasarlandı. Ürün eklemek fotoğraf paylaşmak kadar kolay. Takıldığınız yerde WhatsApp'tan yazın, birlikte kuralım.",
  },
  {
    q: "Fiyat değiştirdiğimde müşteri ne zaman görür?",
    a: "Anında. Kaydet dediğiniz saniyede, açık olan tüm menülerde yeni fiyat görünür. Baskı beklemek yok.",
  },
  {
    q: "QR kodu nasıl alacağım?",
    a: "Kayıt olduğunuzda otomatik oluşur. Panelden yüksek çözünürlüklü indirir, dilediğiniz boyutta bastırırsınız.",
  },
  {
    q: "Müşteri uygulama indirmek zorunda mı?",
    a: "Hayır. QR'ı taradığında menü doğrudan tarayıcıda açılır. İndirme yok, üyelik yok, bekleme yok.",
  },
  {
    q: "Analizler tam olarak neyi gösteriyor?",
    a: "Menünüzün kaç kez açıldığını, hangi ürünlerin en çok incelendiğini, müşterinin menüde ne kadar kaldığını ve trafiğin nereden geldiğini. Yani neyi öne çıkaracağınıza tahminle değil veriyle karar verirsiniz.",
  },
  {
    q: "Ücretsiz plan gerçekten ücretsiz mi?",
    a: "Evet. Kredi kartı istemiyoruz, süre sınırı koymuyoruz. 20 ürüne kadar menünüzü kurar, QR'ınızı alır, yayına geçersiniz. Büyümek isterseniz konuşuruz.",
  },
];

export function FAQ() {
  return (
    <section className="border-t border-line bg-crema/40">
      <div className="mx-auto max-w-3xl px-5 py-24">
        <h2 className="text-center font-display text-4xl font-extrabold tracking-tight">
          Sık sorulanlar
        </h2>
        <div className="mt-10 divide-y divide-line">
          {faqs.map((f) => (
            <details key={f.q} data-reveal className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold transition-colors hover:text-paprika">
                {f.q}
                <span
                  className="shrink-0 text-xl text-paprika transition-transform duration-300 group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-line bg-paper p-8 text-center">
          <p className="font-display text-xl font-bold">Sorunuz listede yok mu?</p>
          <p className="max-w-md text-sm text-ink-soft">
            Yazın, gerçek bir insan cevaplasın. Satış konuşması değil — sadece
            merak ettiğinizi öğrenin.
          </p>
          <a
            href={whatsappLink("Merhaba, menuva hakkında bir sorum var:")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 font-mono text-[13px] uppercase tracking-wider transition-colors hover:bg-ink hover:text-paper"
          >
            <WhatsappIcon size={15} />
            WhatsApp'tan sorun
          </a>
        </div>
      </div>
    </section>
  );
}

// Kapanış CTA'sı herkese hitap etmeli: tek bir "restoran sahibi" tipi
// yok — mahalle kafesi de, zincir de, food truck da aynı yerden başlıyor.
const audiences = [
  "Kafeler",
  "Restoranlar",
  "Pastaneler",
  "Barlar",
  "Food truck'lar",
  "Oteller",
  "Kahvaltı salonları",
  "Bulut mutfaklar",
];

export function ClosingCTA() {
  return (
    <section className="relative overflow-hidden bg-paprika">
      {/* Zeminde yavaşça sürüklenen sıcak ışık */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="blob-drift absolute -left-20 -top-32 h-[28rem] w-[28rem] rounded-full bg-paper/10 blur-3xl" />
        <div
          className="blob-drift absolute -bottom-40 -right-20 h-[26rem] w-[26rem] rounded-full bg-ink/10 blur-3xl"
          style={{ animationDelay: "-8s" }}
        />
      </div>

      <div
        data-reveal
        className="relative mx-auto flex max-w-3xl flex-col items-center gap-7 px-5 py-24 text-center"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/70">
          Beş dakika sonrası
        </p>

        <h2 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-paper md:text-5xl">
          Menünüz bu akşam yayında olabilir.
        </h2>

        <p className="max-w-lg leading-relaxed text-paper/80">
          İster tek şubeli mahalle kafesi olun, ister onlarca masalı bir
          restoran — kurulum aynı: hesabı açın, ürünleri girin, QR'ı masaya
          koyun. Baskı yok, sözleşme yok, kredi kartı yok.
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/panel/register"
            className="shine-on-hover relative overflow-hidden rounded-full bg-ink px-9 py-4 text-center font-mono text-sm uppercase tracking-wider text-paper transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(35,24,18,0.7)]"
          >
            Ücretsiz başla
          </Link>
          <a
            href={whatsappLink("Merhaba, menuva hakkında bilgi almak istiyorum.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-paper/40 px-9 py-4 text-center font-mono text-sm uppercase tracking-wider text-paper transition-all duration-300 hover:-translate-y-0.5 hover:border-paper hover:bg-paper hover:text-paprika"
          >
            <WhatsappIcon size={15} />
            Önce konuşalım
          </a>
        </div>

        {/* Kimler kullanıyor — kayan şerit */}
        <div className="marquee-mask mt-6 w-full overflow-hidden">
          <div className="marquee-track flex w-max gap-3">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 gap-3" aria-hidden={dup === 1}>
                {audiences.map((a) => (
                  <span
                    key={a}
                    className="whitespace-nowrap rounded-full border border-paper/25 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-paper/80"
                  >
                    {a}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
