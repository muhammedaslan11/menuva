import { requireAdmin } from "@/lib/admin/auth";
import { Card, PageHeader, StatCard } from "@/components/admin/ui";
import { SignupChart } from "@/components/admin/signup-chart";
import type { Plan } from "@/lib/types";

const SIGNUP_DAYS = 14;
const PLAN_KEYS: Plan[] = ["freemium", "premium", "elite"];

function isoDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AdminDashboardPage() {
  const { pb } = await requireAdmin();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (SIGNUP_DAYS - 1));
  cutoff.setHours(0, 0, 0, 0);

  // requestKey: null her çağrıda gerekli — aynı `pb` istemcisinden aynı anda
  // birden çok istek (özellikle aynı koleksiyona) gittiğinde PocketBase SDK'sı
  // varsayılan olarak öncekini "auto-cancel" ediyor (bkz. lib/use-auth.ts'teki
  // aynı sorunun panel tarafındaki çözümü).
  const [totalUsersRes, activeBusinessesRes, pendingTicketsRes, activeOwnerRows, planCounts, signupRows] =
    await Promise.all([
      pb.collection("menuva_users").getList(1, 1, { requestKey: null }),
      pb.collection("menuva_businesses").getList(1, 1, { filter: "is_active = true", requestKey: null }),
      pb.collection("menuva_support_tickets").getList(1, 1, { filter: 'status = "open"', requestKey: null }),
      // "Aktif kullanıcı" = en az bir aktif işletmeye sahip hesap sayısı
      // (bir kullanıcı birden fazla işletmeye sahip olabilir, bkz. plans.limits.max_businesses).
      pb.collection("menuva_businesses").getFullList<{ owner: string }>({
        filter: "is_active = true",
        fields: "owner",
        requestKey: null,
      }),
      Promise.all(
        PLAN_KEYS.map(async (plan) => {
          const res = await pb
            .collection("menuva_businesses")
            .getList(1, 1, { filter: pb.filter("plan = {:plan}", { plan }), requestKey: null });
          return [plan, res.totalItems] as const;
        })
      ),
      pb.collection("menuva_users").getFullList<{ created: string }>({
        filter: pb.filter("created >= {:cutoff}", { cutoff: cutoff.toISOString() }),
        fields: "created",
        sort: "created",
        requestKey: null,
      }),
    ]);

  const activeUserCount = new Set(activeOwnerRows.map((r) => r.owner)).size;
  const planMap = Object.fromEntries(planCounts) as Record<Plan, number>;

  // Son SIGNUP_DAYS günü sıfır-doldurulmuş günlük kayıt sayısına dönüştür.
  const dayCounts = new Map<string, number>();
  for (const row of signupRows) {
    const day = row.created.slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }
  const series = Array.from({ length: SIGNUP_DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (SIGNUP_DAYS - 1 - i));
    const key = isoDateOnly(d);
    return { date: key, value: dayCounts.get(key) ?? 0 };
  });

  return (
    <div>
      <PageHeader title="Genel bakış" description="Platformun anlık durumu." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Toplam kullanıcı" value={totalUsersRes.totalItems} />
        <StatCard label="Aktif kullanıcı" value={activeUserCount} hint="En az bir aktif işletmesi olan" />
        <StatCard label="Freemium" value={planMap.freemium ?? 0} />
        <StatCard label="Premium" value={planMap.premium ?? 0} />
        <StatCard label="Elite" value={planMap.elite ?? 0} />
        <StatCard label="Aktif restoran" value={activeBusinessesRes.totalItems} />
        <StatCard label="Bekleyen destek" value={pendingTicketsRes.totalItems} />
      </div>

      <Card className="mt-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          Son {SIGNUP_DAYS} gün — yeni kayıt
        </p>
        <div className="mt-4">
          <SignupChart data={series} />
        </div>
      </Card>
    </div>
  );
}
