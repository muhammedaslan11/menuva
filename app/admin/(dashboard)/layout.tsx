import { requireAdmin } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/shell";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { admin } = await requireAdmin();

  return (
    <AdminShell admin={{ id: admin.id, name: admin.name, email: admin.email, role: admin.role }}>
      {children}
    </AdminShell>
  );
}
