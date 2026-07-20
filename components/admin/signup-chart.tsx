// Tek seri (günlük yeni kayıt) olduğu için ayrı bir kategorik palet/legend
// gerekmiyor — marka rengi tek başına kimliği taşıyor, başlığı Card üstlüğü
// veriyor (bkz. dataviz skill: "a single series needs no legend box").
// CSS değişkenleriyle çiziliyor (var(--color-*)) — admin karanlık modunda
// (app/globals.css [data-theme="dark"]) otomatik uyumlu, ayrı bir dark palet
// tanımlamaya gerek yok.
interface SignupPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

const WIDTH = 560;
const HEIGHT = 120;
const BAR_GAP = 4;

function formatDayLabel(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
}

export function SignupChart({ data }: { data: SignupPoint[] }) {
  if (data.length === 0) return null;

  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = (WIDTH - BAR_GAP * (data.length - 1)) / data.length;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-28 w-full min-w-[420px]"
        role="img"
        aria-label={`Son ${data.length} günde günlük yeni kayıt sayısı`}
      >
        <line x1={0} y1={HEIGHT - 1} x2={WIDTH} y2={HEIGHT - 1} stroke="var(--color-line)" strokeWidth={1} />
        {data.map((point, i) => {
          const isEmpty = point.value === 0;
          const barHeight = isEmpty ? 3 : Math.max(6, (point.value / max) * (HEIGHT - 16));
          const x = i * (barWidth + BAR_GAP);
          const y = HEIGHT - 1 - barHeight;
          return (
            <rect
              key={point.date}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={Math.min(4, barWidth / 2)}
              fill="var(--color-paprika)"
              opacity={isEmpty ? 0.15 : 1}
            >
              <title>{`${formatDayLabel(point.date)}: ${point.value} yeni kayıt`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wider text-ink-soft">
        <span>{formatDayLabel(data[0]?.date ?? "")}</span>
        <span>{formatDayLabel(data[data.length - 1]?.date ?? "")}</span>
      </div>
    </div>
  );
}
