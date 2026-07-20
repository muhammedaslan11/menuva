import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientResponseError } from "pocketbase";
import { requireAdmin } from "@/lib/admin/auth";
import { ArrowLeftIcon } from "@/components/icons";
import { TicketThread } from "@/components/admin/ticket-thread";
import type { SupportTicket, TicketMessage } from "@/lib/types";

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pb } = await requireAdmin();

  let ticket: SupportTicket;
  try {
    ticket = await pb.collection("menuva_support_tickets").getOne<SupportTicket>(id, { expand: "business,user" });
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) notFound();
    throw err;
  }

  const messages = await pb.collection("menuva_ticket_messages").getFullList<TicketMessage>({
    filter: pb.filter("ticket = {:id}", { id }),
    sort: "created",
    expand: "admin",
  });

  return (
    <div>
      <Link
        href="/admin/tickets"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-paprika"
      >
        <ArrowLeftIcon size={15} />
        Destek taleplerine dön
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">{ticket.subject}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {ticket.expand?.business?.name ?? "—"} · {ticket.expand?.user?.email ?? "—"}
        </p>
      </div>

      <TicketThread ticketId={ticket.id} status={ticket.status} messages={messages} />
    </div>
  );
}
