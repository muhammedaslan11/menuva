import { ClockIcon, FlameIcon } from "@/components/icons";
import { whatsappLink } from "@/lib/site";

const demoItems = [
  {
    name: "Izgara Köfte",
    desc: "El yapımı, közlenmiş biber ve pilav ile",
    price: "285₺",
    badge: "Şefin önerisi",
    time: "20 dk",
    kcal: "540 kcal",
  },
  {
    name: "Mantarlı Risotto",
    desc: "Kültür mantarı, parmesan, taze kekik",
    price: "240₺",
    badge: null,
    time: "25 dk",
    kcal: "610 kcal",
  },
  {
    name: "Mevsim Salatası",
    desc: "Roka, nar, ceviz, keçi peyniri",
    price: "165₺",
    badge: "Yeni",
    time: "10 dk",
    kcal: "320 kcal",
  },
  {
    name: "San Sebastian",
    desc: "Yanık cheesecake, dilim",
    price: "150₺",
    badge: "Popüler",
    time: "5 dk",
    kcal: "430 kcal",
  },
  {
    name: "Türk Kahvesi",
    desc: "Çifte kavrulmuş lokum eşliğinde",
    price: "70₺",
    badge: null,
    time: "8 dk",
    kcal: "45 kcal",
  },
];

function PhoneMock() {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-[290px] rounded-[2.4rem] border-[6px] border-ink bg-[#171310] p-3 shadow-[0_28px_60px_-18px_rgba(35,24,18,0.45)]"
    >
      {/* çentik */}
      <div className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />

      <div className="h-[520px] overflow-hidden rounded-[1.8rem] bg-[#171310] pt-8">
        {/* menü başlığı */}
        <div className="px-4 pb-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-paprika">
            kardelen.menuva.app
          </p>
          <p className="font-display text-lg font-bold text-paper">
            Kardelen Cafe
          </p>
          <div className="mt-2 flex gap-1.5 font-mono text-[9px]">
            <span className="rounded-full bg-paprika px-2.5 py-1 text-paper">
              Ana Yemek
            </span>
            <span className="rounded-full bg-paper/10 px-2.5 py-1 text-paper/60">
              Salatalar
            </span>
            <span className="rounded-full bg-paper/10 px-2.5 py-1 text-paper/60">
              Tatlılar
            </span>
          </div>
        </div>

        {/* ürün listesi — hafifçe kayarak canlı olduğunu hissettirir */}
        <div className="menu-drift space-y-2 px-4">
          {demoItems.map((item) => (
            <div key={item.name} className="rounded-lg bg-paper/[0.06] p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {item.badge && (
                    <span className="mb-1 inline-block rounded bg-paprika/15 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-paprika">
                      {item.badge}
                    </span>
                  )}
                  <p className="text-[13px] font-semibold text-paper">
                    {item.name}
                  </p>
                  <p className="text-[10px] leading-snug text-paper/50">
                    {item.desc}
                  </p>
                </div>
                <span className="font-mono text-[13px] font-medium text-paper">
                  {item.price}
                </span>
              </div>
              <div className="mt-2 flex gap-3 font-mono text-[9px] text-paper/40">
                <span className="flex items-center gap-1">
                  <ClockIcon size={10} /> {item.time}
                </span>
                <span className="flex items-center gap-1">
                  <FlameIcon size={10} /> {item.kcal}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* sepet çubuğu */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-paprika px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-paper">
            Sepet · 2 ürün
          </span>
          <span className="font-mono text-sm font-bold text-paper">450₺</span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-16 md:grid-cols-[1.1fr_0.9fr] md:pt-24">
      <div>
        <p className="rise rise-1 font-mono text-[13px] uppercase tracking-[0.2em] text-paprika">
          Dijital QR menü — ve daha fazlası
        </p>
        <h1 className="rise rise-2 mt-4 font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-[4.2rem]">
          Kâğıt menü devri{" "}
          <span className="relative inline-block text-paprika">
            kapandı.
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 200 12"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 9C60 3 140 3 197 7"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>
        <p className="rise rise-3 mt-7 max-w-lg text-lg leading-relaxed text-ink-soft">
          Menünüzü dakikalar içinde dijitalleştirin. Fiyat güncelleyin,
          kampanya ekleyin, QR kodla paylaşın. Baskı maliyeti yok, bekleme
          yok — değişiklikleriniz anında her masada.
        </p>
        <div className="rise rise-4 mt-9 flex flex-wrap items-center gap-6">
          <a
            href={whatsappLink("Merhaba, menuva hakkında bilgi almak istiyorum.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-paprika px-8 py-4 font-mono text-sm uppercase tracking-wider text-paper transition-colors hover:bg-paprika-deep"
          >
            Hemen başla
          </a>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-crema/60 p-3">
            <picture>
              <img src="/demo-qr.svg" alt="Demo menü QR kodu" width={64} height={64} />
            </picture>
            <p className="max-w-[130px] font-mono text-[11px] leading-snug text-ink-soft">
              Telefonunla tara, demo menüyü canlı gör
            </p>
          </div>
        </div>
      </div>

      <div className="rise rise-4">
        <PhoneMock />
      </div>
    </section>
  );
}
