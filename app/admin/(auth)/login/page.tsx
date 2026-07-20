import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div className="rounded-2xl border border-line bg-paper p-8">
      <h1 className="font-display text-xl font-bold">Yönetim paneline giriş</h1>
      <p className="mt-1 text-sm text-ink-soft">Bu alan yalnızca yetkili menuva ekibi içindir.</p>
      <AdminLoginForm />
    </div>
  );
}
