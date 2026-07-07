import { pb } from "@/lib/pocketbase";

export type UploadKind = "logo" | "cover" | "product" | "popup";

export async function uploadFile(file: File, businessId: string, kind: UploadKind): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("businessId", businessId);
  form.append("kind", kind);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: pb.authStore.token },
    body: form,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Yükleme başarısız oldu.");
  }
  return data.url as string;
}
