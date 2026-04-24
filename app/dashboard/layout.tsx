import { isAdmin, requireUserOrRedirect } from "@/lib/auth/get-session";
import { DashboardAppHeader } from "@/components/layout/DashboardAppHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUserOrRedirect();

  return (
    <div className="min-h-screen bg-primary-50/30">
      <DashboardAppHeader
        user={{
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        }}
        showAdminLink={isAdmin(user)}
        showCertificatesLink
      />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
