import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientResponseError } from "pocketbase";
import { requireAdmin } from "@/lib/admin/auth";
import { ArrowLeftIcon } from "@/components/icons";
import { UserDetail } from "@/components/admin/user-detail";
import type { Business } from "@/lib/types";

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  created: string;
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pb } = await requireAdmin();

  let user: AdminUserRecord;
  try {
    user = await pb.collection("menuva_users").getOne<AdminUserRecord>(id);
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) notFound();
    throw err;
  }

  const businesses = await pb.collection("menuva_businesses").getFullList<Business>({
    filter: pb.filter("owner = {:id}", { id }),
    sort: "-created",
  });

  return (
    <div>
      <Link href="/admin/users" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-paprika">
        <ArrowLeftIcon size={15} />
        Kullanıcılara dön
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">{user.name || "(isimsiz)"}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {user.email} · Kayıt: {new Date(user.created).toLocaleDateString("tr-TR")}
        </p>
      </div>

      <UserDetail userId={user.id} businesses={businesses} />
    </div>
  );
}
