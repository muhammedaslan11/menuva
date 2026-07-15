// Marka rengi işletme sahibi tarafından seçildiği için herhangi bir tonda
// olabilir (beyaza yakın dahil). Bu yardımcılar seçilen renk ne olursa
// olsun üzerine/yanına gelen metnin her zaman okunaklı kalmasını sağlar.

const INK = "#231812"; // globals.css --color-ink
export const PAPER = "#fbf5ea"; // globals.css --color-paper

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean.padEnd(6, "0").slice(0, 6);
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(l1: number, l2: number): number {
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn: h = ((gn - bn) / d) % 6; break;
      case gn: h = (bn - rn) / d + 2; break;
      default: h = (rn - gn) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: [number, number, number] = [0, 0, 0];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return [(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255];
}

function safeHexToRgb(hex: string): [number, number, number] {
  try {
    return hexToRgb(hex);
  } catch {
    return hexToRgb(INK);
  }
}

/**
 * Bir zeminin (ör. seçilen marka rengi) üzerine gelecek metin için ink/paper
 * tonlarından okunaklı olanı seçer. Paper (açık metin), uygulamanın genelinde
 * renkli butonlarda kullanılan varsayılan — WCAG'in katı 4.5 eşiği bazı doygun
 * tonlarda (ör. mevcut paprika rengi) ince metinler için ink'i işaret etse de,
 * kalın/büyük metin eşiği olan 3'ü geçtiği sürece paper'da kalıp mevcut
 * marka diliyle tutarlı görünmeyi tercih ediyoruz. Gerçekten okunaksız
 * olduğunda (ör. beyaza yakın bir marka rengi) ink'e düşer.
 */
export function pickReadableOn(bgHex: string): string {
  const bgLum = relativeLuminance(safeHexToRgb(bgHex));
  const paperContrast = contrastRatio(bgLum, relativeLuminance(hexToRgb(PAPER)));
  if (paperContrast >= 3) return PAPER;
  const inkContrast = contrastRatio(bgLum, relativeLuminance(hexToRgb(INK)));
  return inkContrast > paperContrast ? INK : PAPER;
}

/**
 * Bir rengi, verilen zemin üzerinde doğrudan METİN olarak kullanılabilecek
 * kadar okunaklı olana dek kademeli koyulaştırır (marka rengi paper zemin
 * üzerinde çok açıksa bile fiyat/etiket gibi metinler görünür kalır).
 */
export function readableAccent(hex: string, bgHex: string = PAPER, minRatio = 3): string {
  const bgLum = relativeLuminance(safeHexToRgb(bgHex));
  let rgb = safeHexToRgb(hex);
  if (contrastRatio(relativeLuminance(rgb), bgLum) >= minRatio) {
    return rgbToHex(rgb);
  }
  const [h, s] = rgbToHsl(rgb);
  let l = rgbToHsl(rgb)[2];
  // Zemin açıksa koyulaştır, zemin koyuysa açıklaştır.
  const step = bgLum > 0.5 ? -0.03 : 0.03;
  for (let i = 0; i < 40; i++) {
    l = Math.max(0.02, Math.min(0.98, l + step));
    rgb = hslToRgb([h, s, l]);
    if (contrastRatio(relativeLuminance(rgb), bgLum) >= minRatio) break;
  }
  return rgbToHex(rgb);
}

/**
 * Dolu (arka planı marka rengi olan) buton/aktif-sekme gibi yüzeylerin,
 * marka rengi sayfa zeminine (paper) çok yakın seçildiğinde bile (ör. beyaza
 * yakın bir ton) sayfadan hiç ayrışmadan kaybolmamasını sağlar. Metin
 * okunaklılığından (readableAccent, eşik 3+) daha gevşek bir eşik kullanır —
 * burada "okunması" değil, bir yüzey olarak "farkedilmesi" yeterli.
 */
export function visibleFill(hex: string, bgHex: string = PAPER): string {
  return readableAccent(hex, bgHex, 1.5);
}

// Kullanıcının girdiği özel rengin geçerli bir hex olup olmadığını doğrular
// (#rgb ya da #rrggbb). Menü özelleştirmesinde preset dışı renk için kullanılır.
export function isValidHex(value: string | null | undefined): value is string {
  return !!value && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}
