import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { DataTable, PageHeader, Pagination } from "@/components/admin/ui";
import { AdminFilterBar } from "@/components/admin/filter-bar";
import type { AdminLog } from "@/lib/types";

const PER_PAGE = 30;

const ACTION_OPTIONS = [
  "login",
  "login_failed",
  "logout",
  "user_delete",
  "business_plan_change",
  "business_activate",
  "business_deactivate",
  "user_activate_all",
  "user_deactivate_all",
  "ticket_reply",
  "ticket_status_change",
  "notification_send",
  "plan_create",
  "plan_update",
  "plan_set_default",
  "plan_delete",
];

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; action?: string; view?: string }>;
}) {
  const { pb } = await requireAdmin({ role: "super_admin" });
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const isLoginView = sp.view === "login";

  const filters: string[] = [];
  if (isLoginView) {
    filters.push('action ~ "login"');
  } else if (sp.action) {
    filters.push(pb.filter("action = {:action}", { action: sp.action }));
  }
  if (sp.q?.trim()) filters.push(pb.filter("target ~ {:q}", { q: sp.q.trim() }));

  const result = await pb.collection("menuva_admin_logs").getList<AdminLog>(page, PER_PAGE, {
    filter: filters.join(" && "),
    sort: "-created",
    expand: "admin",
  });

  const tabBase =
    "rounded-full px-4 py-1.5 font-mono text-[12px] uppercase tracking-wider transition-colors";

  return (
    <div>
      <PageHeader title="Sistem logları" description={`${result.totalItems} kayıt`} />

      <div className="mb-6 flex gap-2">
        <Link href="/admin/logs" className={`${tabBase} ${!isLoginView ? "bg-ink text-paper" : "border border-line text-ink-soft hover:text-ink"}`}>
          Tümü
        </Link>
        <Link
          href="/admin/logs?view=login"
          className={`${tabBase} ${isLoginView ? "bg-ink text-paper" : "border border-line text-ink-soft hover:text-ink"}`}
        >
          Giriş geçmişi
        </Link>
      </div>

      <AdminFilterBar
        basePath={isLoginView ? "/admin/logs" : "/admin/logs"}
        searchParams={sp}
        searchPlaceholder="Hedef ara (id / e-posta)…"
        selects={
          isLoginView
            ? []
            : [
                {
                  name: "action",
                  label: "Eylem",
                  options: ACTION_OPTIONS.map((a) => ({ value: a, label: a })),
                },
              ]
        }
      />

      <DataTable<AdminLog>
        emptyTitle="Kayıt bulunamadı"
        columns={[
          {
            key: "action",
            header: "Eylem",
            render: (l) => <span className="font-mono text-[12px] text-ink">{l.action}</span>,
          },
          {
            key: "admin",
            header: "Admin",
            render: (l) => l.expand?.admin?.name ?? <span className="text-ink-soft">—</span>,
          },
          { key: "target", header: "Hedef", render: (l) => <span className="text-ink-soft">{l.target || "—"}</span> },
          { key: "ip", header: "IP", render: (l) => <span className="text-ink-soft">{l.ip || "—"}</span> },
          {
            key: "created",
            header: "Zaman",
            render: (l) => new Date(l.created).toLocaleString("tr-TR"),
          },
        ]}
        rows={result.items}
      />

      <Pagination page={result.page} totalPages={result.totalPages} basePath="/admin/logs" searchParams={sp} />
    </div>
  );
}
