"use client";

import { useRouter } from "next/navigation";
import { useBusiness } from "@/components/panel/business-context";
import { PopupForm } from "@/components/panel/popup-form";
import { PageHeader } from "@/components/panel/ui";

export default function NewAnnouncementPage() {
  const { business, isLoading } = useBusiness();
  const router = useRouter();

  if (isLoading || !business) {
    return <p className="text-ink-soft">Yükleniyor…</p>;
  }

  return (
    <div>
      <PageHeader title="Yeni duyuru" />
      <PopupForm business={business} onSaved={() => router.replace("/panel/popups")} onCancel={() => router.back()} />
    </div>
  );
}
