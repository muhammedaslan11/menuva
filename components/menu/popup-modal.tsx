"use client";

import Image from "next/image";
import type { Popup } from "@/lib/types";
import { useMenu } from "@/components/menu/menu-provider";

export function PopupModal({ popup, onClose }: { popup: Popup; onClose: () => void }) {
  const { t } = useMenu();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-5" onClick={onClose}>
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-paper shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {popup.image_url && (
          <div className="relative h-40 w-full">
            <Image src={popup.image_url} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="p-6 text-center">
          <h2 className="font-display text-xl font-bold">{popup.title}</h2>
          {popup.message && <p className="mt-2 text-sm text-ink-soft">{popup.message}</p>}
          <button
            onClick={onClose}
            style={{ background: "var(--brand)", color: "var(--brand-on)" }}
            className="mt-5 rounded-full px-6 py-2.5 font-mono text-[13px] uppercase tracking-wider transition-opacity hover:opacity-90"
          >
            {t("viewMenu")}
          </button>
        </div>
      </div>
    </div>
  );
}
