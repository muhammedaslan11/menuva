import Link from "next/link";
import { Logo } from "@/components/chrome";

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-crema/40 px-5 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        {children}
      </div>
    </div>
  );
}
