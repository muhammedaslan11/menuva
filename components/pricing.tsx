import Link from "next/link";
import { whatsappLink } from "@/lib/site";

const plans = [
  {
    name: "Freemium",
    price: "0₺",
    period: "sonsuza kadar",
    desc: "Denemek ve küçük menüler için",
    features: ["1 menü", "20 ürüne kadar", "QR kod & özel URL", "Anlık güncellemeler"],
    cta: "Ücretsiz başla",
    href: "/panel/register",
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
      "Kalori & alerjen bilgisi",
      "Pop-up kampanyalar",
      "Sipariş sepeti",
      "Markanıza özel tasarım",
    ],
    cta: "Erken erişime katıl",
    href: whatsappLink("Merhaba, Menuva Premium paket hakkında bilgi almak istiyorum."),
    highlight: true,
  },
  {
    name: "Elite",
    price: "—",
    period: "yıllık, yakında",
    desc: "Zincirler ve çoklu şubeler için",
    features: ["Menuva Premium'daki her şey", "Çoklu şube yönetimi", "Özel alan adı", "Öncelikli destek"],
    cta: "Bize yazın",
    href: whatsappLink("Merhaba, Menuva Elite paket hakkında bilgi almak istiyorum."),
    highlight: false,
  },
];

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
        Bir kez menü bastırmanın parasıyla aylarca dijital kalın.
      </p>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            data-reveal
            className={`flex flex-col rounded-2xl border p-8 ${p.highlight
              ? "border-paprika bg-ink text-paper shadow-[0_24px_50px_-20px_rgba(232,73,31,0.4)]"
              : "border-line bg-paper"
              }`}
          >
            <h3 className="font-display text-xl font-bold">{p.name}</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-5xl font-extrabold">
                {p.price}
              </span>
              <span
                className={`font-mono text-xs uppercase tracking-wider ${p.highlight ? "text-paper/50" : "text-ink-soft"
                  }`}
              >
                {p.period}
              </span>
            </div>
            <p
              className={`mt-2 text-sm ${p.highlight ? "text-paper/60" : "text-ink-soft"
                }`}
            >
              {p.desc}
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-herb" aria-hidden>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={p.href}
              target={p.href.startsWith("http") ? "_blank" : undefined}
              rel={p.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`mt-8 rounded-full py-3.5 text-center font-mono text-[13px] uppercase tracking-wider transition-colors ${p.highlight
                ? "bg-paprika text-paper hover:bg-paprika-deep"
                : "border border-ink text-ink hover:bg-ink hover:text-paper"
                }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Teknik bilgim yok, kullanabilir miyim?",
    a: "Kesinlikle. menuva, telefon kullanabilen herkes için tasarlandı. Ürün eklemek fotoğraf paylaşmak kadar kolay.",
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
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-bold">
                {f.q}
                <span
                  className="text-paprika transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClosingCTA() {
  return (
    <section className="bg-paprika">
      <div data-reveal className="mx-auto flex max-w-6xl flex-col items-center gap-7 px-5 py-20 text-center">
        <h2 className="max-w-2xl font-display text-4xl font-extrabold tracking-tight text-paper md:text-5xl">
          Menünüz bu akşam yayında olabilir.
        </h2>
        <a
          href={whatsappLink("Merhaba, menuva hakkında bilgi almak istiyorum.")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-ink px-9 py-4 font-mono text-sm uppercase tracking-wider text-paper transition-transform hover:scale-105"
        >
          Hemen başla
        </a>
        <p className="font-mono text-xs uppercase tracking-wider text-paper/70">
          Kredi kartı gerekmez · 5 dakikada kurulum
        </p>
      </div>
    </section>
  );
}
