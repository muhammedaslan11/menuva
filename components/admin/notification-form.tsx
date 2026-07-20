"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, ErrorText, Input, Label, Select, Textarea } from "@/components/admin/ui";
import { sendNotificationAction } from "@/app/admin/(dashboard)/notifications/actions";
import type { NotificationAudience } from "@/lib/types";

const audienceOptions: { value: NotificationAudience; label: string }[] = [
  { value: "all", label: "Tüm kullanıcılar" },
  { value: "freemium", label: "Freemium" },
  { value: "premium", label: "Premium" },
  { value: "elite", label: "Elite" },
  { value: "user", label: "Belirli kullanıcı" },
];

export function NotificationForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<NotificationAudience>("all");
  const [userEmail, setUserEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Başlık ve mesaj gerekli.");
      return;
    }
    if (audience === "user" && !userEmail.trim()) {
      setError("Belirli kullanıcı için e-posta gerekli.");
      return;
    }
    setError("");
    startTransition(async () => {
      const res = await sendNotificationAction({
        title,
        body,
        audience,
        userEmail: userEmail.trim() || undefined,
      });
      if (res.error) {
        setError(res.error);
      } else {
        setTitle("");
        setBody("");
        setUserEmail("");
        setAudience("all");
        router.refresh();
      }
    });
  }

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="notif-title">Başlık</Label>
          <Input id="notif-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={pending} />
        </div>
        <div>
          <Label htmlFor="notif-body">Mesaj</Label>
          <Textarea
            id="notif-body"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="notif-audience">Kime</Label>
            <Select
              id="notif-audience"
              value={audience}
              disabled={pending}
              onChange={(e) => setAudience(e.target.value as NotificationAudience)}
              className="w-auto"
            >
              {audienceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          {audience === "user" && (
            <div className="min-w-[220px] flex-1">
              <Label htmlFor="notif-email">Kullanıcı e-postası</Label>
              <Input
                id="notif-email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="ornek@eposta.com"
                disabled={pending}
              />
            </div>
          )}
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={pending}>
          Gönder
        </Button>
      </form>
    </Card>
  );
}
