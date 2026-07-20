import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { Badge, DataTable, PageHeader, Pagination } from "@/components/admin/ui";
import { AdminFilterBar } from "@/components/admin/filter-bar";
import type { SupportTicket, TicketStatus } from "@/lib/types";

const PER_PAGE = 20;

const statusLabels: Record<TicketStatus, string> = {
  open: "Açık",
  answered: "Yanıtlandı",
  closed: "Kapalı",
};

const statusTone: Record<TicketStatus, "danger" | "success" | "neutral"> = {
  open: "danger",
  answered: "success",
  closed: "neutral",
};

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const { pb } = await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const filters: string[] = [];
  if (sp.q?.trim()) filters.push(pb.filter("subject ~ {:q}", { q: sp.q.trim() }));
  if (sp.status) filters.push(pb.filter("status = {:status}", { status: sp.status }));

  const result = await pb.collection("menuva_support_tickets").getList<SupportTicket>(page, PER_PAGE, {
    filter: filters.join(" && "),
    sort: "-created",
    expand: "business,user",
  });

  return (
    <div>
      <PageHeader title="Destek talepleri" description={`${result.totalItems} talep`} />

      <AdminFilterBar
        basePath="/admin/tickets"
        searchParams={sp}
        searchPlaceholder="Konu ara…"
        selects={[
          {
            name: "status",
            label: "Durum",
            options: [
              { value: "open", label: "Açık" },
              { value: "answered", label: "Yanıtlandı" },
              { value: "closed", label: "Kapalı" },
            ],
          },
        ]}
      />

      <DataTable<SupportTicket>
        emptyTitle="Talep bulunamadı"
        columns={[
          {
            key: "subject",
            header: "Konu",
            render: (t) => (
              <Link href={`/admin/tickets/${t.id}`} className="font-medium text-ink hover:text-paprika">
                {t.subject}
              </Link>
            ),
          },
          { key: "business", header: "İşletme", render: (t) => t.expand?.business?.name ?? "—" },
          { key: "user", header: "Kullanıcı", render: (t) => t.expand?.user?.email ?? "—" },
          {
            key: "status",
            header: "Durum",
            render: (t) => <Badge tone={statusTone[t.status]}>{statusLabels[t.status]}</Badge>,
          },
          {
            key: "created",
            header: "Oluşturma",
            render: (t) => new Date(t.created).toLocaleDateString("tr-TR"),
          },
        ]}
        rows={result.items}
      />

      <Pagination page={result.page} totalPages={result.totalPages} basePath="/admin/tickets" searchParams={sp} />
    </div>
  );
}
