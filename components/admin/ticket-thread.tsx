"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, ErrorText, Select, Textarea } from "@/components/admin/ui";
import { replyToTicketAction, setTicketStatusAction } from "@/app/admin/(dashboard)/tickets/[id]/actions";
import type { TicketMessage, TicketStatus } from "@/lib/types";

const statusLabels: Record<TicketStatus, string> = {
  open: "Açık",
  answered: "Yanıtlandı",
  closed: "Kapalı",
};

export function TicketThread({
  ticketId,
  status,
  messages,
}: {
  ticketId: string;
  status: TicketStatus;
  messages: TicketMessage[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError("");
    startTransition(async () => {
      const res = await replyToTicketAction(ticketId, body);
      if (res.error) {
        setError(res.error);
      } else {
        setBody("");
        router.refresh();
      }
    });
  }

  function handleStatusChange(next: TicketStatus) {
    setError("");
    startTransition(async () => {
      const res = await setTicketStatusAction(ticketId, next);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-ink-soft">Durum:</span>
        <Select
          value={status}
          disabled={pending}
          onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
          className="w-auto"
        >
          <option value="open">{statusLabels.open}</option>
          <option value="answered">{statusLabels.answered}</option>
          <option value="closed">{statusLabels.closed}</option>
        </Select>
      </div>

      <div className="space-y-3">
        {messages.map((m) => (
          <Card key={m.id} className={m.sender === "admin" ? "border-paprika/30 bg-paprika/5" : ""}>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              {m.sender === "admin" ? `menuva ekibi${m.expand?.admin?.name ? ` · ${m.expand.admin.name}` : ""}` : "Kullanıcı"}{" "}
              · {new Date(m.created).toLocaleString("tr-TR")}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{m.body}</p>
          </Card>
        ))}
      </div>

      {status !== "closed" ? (
        <form onSubmit={handleReply} className="mt-6 space-y-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Yanıt yaz…"
            disabled={pending}
          />
          <ErrorText>{error}</ErrorText>
          <Button type="submit" loading={pending}>
            Yanıtla
          </Button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-ink-soft">Bu talep kapalı — yanıtlamak için önce durumu değiştir.</p>
      )}
    </div>
  );
}
