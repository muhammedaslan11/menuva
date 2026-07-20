import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { DataTable, PageHeader, Pagination } from "@/components/admin/ui";
import { AdminFilterBar } from "@/components/admin/filter-bar";

const PER_PAGE = 20;

interface UserRow {
  id: string;
  name: string;
  email: string;
  created: string;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; plan?: string; status?: string }>;
}) {
  const { pb } = await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() ?? "";

  // "menuva_businesses_via_owner" — users koleksiyonundan businesses.owner alanına
  // ters ilişki (back-relation) ile filtreleme; PocketBase'in <coll>_via_<field>
  // sözdizimi (bkz. lib/pocketbase.ts'teki pb.filter kullanım deseni).
  const filters: string[] = [];
  if (q) filters.push(pb.filter("(name ~ {:q} || email ~ {:q})", { q }));
  if (sp.plan) filters.push(pb.filter("menuva_businesses_via_owner.plan = {:plan}", { plan: sp.plan }));
  if (sp.status === "active") filters.push("menuva_businesses_via_owner.is_active = true");
  if (sp.status === "inactive") filters.push("menuva_businesses_via_owner.is_active = false");

  const result = await pb.collection("menuva_users").getList<UserRow>(page, PER_PAGE, {
    filter: filters.join(" && "),
    sort: "-created",
  });

  return (
    <div>
      <PageHeader title="Kullanıcılar" description={`${result.totalItems} kayıtlı hesap`} />

      <AdminFilterBar
        basePath="/admin/users"
        searchParams={sp}
        searchPlaceholder="İsim veya e-posta ara…"
        selects={[
          {
            name: "plan",
            label: "Plan",
            options: [
              { value: "freemium", label: "Freemium" },
              { value: "premium", label: "Premium" },
              { value: "elite", label: "Elite" },
            ],
          },
          {
            name: "status",
            label: "İşletme durumu",
            options: [
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Pasif" },
            ],
          },
        ]}
      />

      <DataTable<UserRow>
        emptyTitle="Kullanıcı bulunamadı"
        emptyDescription="Farklı bir arama veya filtre deneyin."
        columns={[
          {
            key: "name",
            header: "İsim",
            render: (u) => (
              <Link href={`/admin/users/${u.id}`} className="font-medium text-ink hover:text-paprika">
                {u.name || "(isimsiz)"}
              </Link>
            ),
          },
          { key: "email", header: "E-posta", render: (u) => <span className="text-ink-soft">{u.email}</span> },
          {
            key: "created",
            header: "Kayıt tarihi",
            render: (u) => new Date(u.created).toLocaleDateString("tr-TR"),
          },
        ]}
        rows={result.items}
      />

      <Pagination page={result.page} totalPages={result.totalPages} basePath="/admin/users" searchParams={sp} />
    </div>
  );
}
