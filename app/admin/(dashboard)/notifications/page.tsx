import { requireAdmin } from "@/lib/admin/auth";
import { Badge, EmptyState, PageHeader, Pagination } from "@/components/admin/ui";
import { NotificationForm } from "@/components/admin/notification-form";
import type { Notification, NotificationAudience } from "@/lib/types";

const PER_PAGE = 20;

const audienceLabels: Record<NotificationAudience, string> = {
  all: "Herkes",
  freemium: "Freemium",
  premium: "Premium",
  elite: "Elite",
  user: "Belirli kullanıcı",
};

interface NotificationRow extends Notification {
  expand?: { user?: { email: string } };
}

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { pb } = await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const result = await pb.collection("menuva_notifications").getList<NotificationRow>(page, PER_PAGE, {
    sort: "-created",
    expand: "user",
  });

  return (
    <div>
      <PageHeader title="Bildirimler" description={`${result.totalItems} bildirim gönderildi`} />

      <NotificationForm />

      {result.items.length === 0 ? (
        <EmptyState title="Henüz bildirim gönderilmedi" />
      ) : (
        <div className="space-y-3">
          {result.items.map((n) => (
            <div key={n.id} className="rounded-2xl border border-line bg-paper p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-ink">{n.title}</p>
                <Badge tone="neutral">
                  {audienceLabels[n.audience]}
                  {n.audience === "user" && n.expand?.user?.email ? ` · ${n.expand.user.email}` : ""}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{n.body}</p>
              <p className="mt-2 text-xs text-ink-soft">{new Date(n.created).toLocaleString("tr-TR")}</p>
            </div>
          ))}
        </div>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} basePath="/admin/notifications" searchParams={sp} />
    </div>
  );
}
