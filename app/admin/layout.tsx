import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import { AdminAppHeader } from "@/components/layout/AdminAppHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminOrRedirect();

  return (
    <div className="min-h-screen bg-primary-50/30">
      <AdminAppHeader
        user={{
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        }}
      />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
