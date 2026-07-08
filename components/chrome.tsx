import Link from "next/link";
import { whatsappLink } from "@/lib/site";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`font-display text-2xl font-extrabold tracking-tight ${
        light ? "text-paper" : "text-ink"
      }`}
    >
      menuva<span className="text-paprika">.</span>app
    </span>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" aria-label="menuva ana sayfa">
          <Logo />
        </Link>
        <div className="hidden items-center gap-8 font-mono text-[13px] uppercase tracking-wider text-ink-soft md:flex">
          <a href="#menu" className="transition-colors hover:text-paprika">
            Özellikler
          </a>
          <a href="#nasil" className="transition-colors hover:text-paprika">
            Nasıl çalışır
          </a>
          <a href="#fiyat" className="transition-colors hover:text-paprika">
            Fiyatlar
          </a>
        </div>
        <a
          href={whatsappLink("Merhaba, menuva hakkında bilgi almak istiyorum.")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-ink px-5 py-2.5 font-mono text-[13px] uppercase tracking-wider text-paper transition-colors hover:bg-paprika"
        >
          Hemen başla
        </a>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink text-paper/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 md:flex-row md:items-end md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo light />
          <p className="text-sm leading-relaxed">
            Restoranlar ve kafeler için dijital QR menü platformu. Menünü bir
            kez kur, her masada güncel kalsın.
          </p>
        </div>
        <div className="flex gap-12 font-mono text-[13px] uppercase tracking-wider">
          <div className="flex flex-col gap-2">
            <span className="text-paper">Ürün</span>
            <a href="#menu" className="transition-colors hover:text-paprika">Özellikler</a>
            <a href="#fiyat" className="transition-colors hover:text-paprika">Fiyatlar</a>
            <a href="/demo" className="transition-colors hover:text-paprika">Demo menü</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-paper">İletişim</span>
            <a href="mailto:merhaba@menuva.app" className="transition-colors hover:text-paprika">
              merhaba@menuva.app
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-paper/10 py-5 text-center font-mono text-xs text-paper/40">
        © {new Date().getFullYear()} menuva — Afiyet olsun.
      </div>
    </footer>
  );
}
