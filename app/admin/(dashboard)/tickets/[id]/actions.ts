"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/log";
import type { TicketStatus } from "@/lib/types";

export async function replyToTicketAction(ticketId: string, body: string): Promise<{ error?: string }> {
  const trimmed = body.trim();
  if (!trimmed) return { error: "Mesaj boş olamaz." };

  const { pb, admin } = await requireAdmin();

  try {
    await pb.collection("menuva_ticket_messages").create({
      ticket: ticketId,
      sender: "admin",
      admin: admin.id,
      body: trimmed,
    });
    // Admin yanıtladığında talep otomatik "answered" olur — kullanıcı tekrar
    // yazarsa (bkz. panel support/[id]/page.tsx) "open"a geri döner.
    await pb.collection("menuva_support_tickets").update(ticketId, { status: "answered" });
    await logAdminAction(pb, { admin: admin.id, action: "ticket_reply", target: ticketId });
  } catch {
    return { error: "Gönderilemedi." };
  }

  revalidatePath("/admin/tickets/[id]", "page");
  revalidatePath("/admin/tickets", "page");
  return {};
}

export async function setTicketStatusAction(ticketId: string, status: TicketStatus): Promise<{ error?: string }> {
  const { pb, admin } = await requireAdmin();

  try {
    await pb.collection("menuva_support_tickets").update(ticketId, { status });
    await logAdminAction(pb, {
      admin: admin.id,
      action: "ticket_status_change",
      target: ticketId,
      meta: { status },
    });
  } catch {
    return { error: "Durum güncellenemedi." };
  }

  revalidatePath("/admin/tickets/[id]", "page");
  revalidatePath("/admin/tickets", "page");
  return {};
}
